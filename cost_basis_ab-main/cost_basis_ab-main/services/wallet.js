//const bigdecimal = require("bigdecimal");
const {
  chainCoins,
  debank_chain_details,
  debank_protocol_ref,
  debank_wrapped_tokens,
  debank_reward_tokens,
  COMPOUNDING_TOKENS,
  CovalentPrices,
} = require("../constant");
const FAST_MODE = true;
const timeCost = {
  ercTokenPrice: {
    timeCost: 0,
    count: 0,
  },
  nativeCoinPrice: {
    timeCost: 0,
    count: 0,
  },
  getTransData: {
    timeCost: 0,
    count: 0,
  },
  tokenCostBasis: {
    timeCost: 0,
    count: 0,
  },
  get_debank_token: {
    timeCost: 0,
    count: 0,
  },
  makeTokenResult: {
    timeCost: 0,
    count: 0,
  },
};

const {
  getCurrentBlockNumber,
  getTokenBalances,
  getTokenTransfers,
  getTransactions,
  getTokenPrice,
  getAssetsFromHistory,
  getDebankValue,
  getCovalentPrice,
} = require("../helpers/moralis");

const {
  getTokenInfoByDebank,
  getDeBankComplexProtocol,
  getSupplyTokens,
  get_debank_token,
  poolKey,
  reward_tokens,
} = require("../helpers/debank");

const Utils = require("../utils");
const REF_ASSETS = require("./../data/vfat_all.json");
const debank_protocol_tags = require("./../data/debank/protocol_list.json");
const MODE_SETTING = require("./../config").CONFIG.mode;
const global_token_protocol = require("./../data/token2protocol.json");

async function getWalletsCostHistory(wallet_data, job) {
  const global_token_info_debank = await getTokenInfoByDebank(
    wallet_data.wallet
  );
  const global_complex_protocol_debank = await getDeBankComplexProtocol(
    wallet_data.wallet
  );

  // global_token_info_debank = global_token_info_debank.filter(
  //   (x) => !COMPOUNDING_TOKENS[x.id]
  // );

  const wallet_positions = global_token_info_debank.filter(
    (position) => position.is_verified || position.protocol_id != ""
  ); //Skip spam tokens

  const resultData = [];
  const resultFootnotes = [];
  let i = 0;

  let status_job = {
    part: [],
    total: wallet_positions.length,
  };

  const arr = [];

  for (const chain in chainCoins) {
    //if (chain != "polygon") continue;
    if (wallet_data.jobChain && wallet_data.jobChain != chain) {
      console.log(`Skip ${chain} target chain is ${wallet_data.jobChain}`);
      continue;
    }

    status_job.part.push({
      current: 0,
      total: 0,
      chain: chainCoins[chain].name_network,
    });

    job.progress(status_job);

    const balances = global_token_info_debank
      .filter((item) => item.chain == chainCoins[chain].chainId)
      .map((item) => {
        if (item.protocol_id === "") {
          const protocolRow = global_token_protocol.find(
            (row) =>
              row.chain === item.chain &&
              row.token.toLowerCase() === item.id.toLowerCase()
          );
          if (protocolRow) {
            item.protocol_id = protocolRow.protocol;
          }
        }
        return item;
      });

    const complex = global_complex_protocol_debank.filter(
      (item) => item.chain == chainCoins[chain].chainId
    );

    if (balances.length == 0 && complex.length == 0) continue;

    arr.push(
      getWalletCostBasis(
        {
          chain,
          wallet: wallet_data.wallet,
          jobProtocol: wallet_data.jobProtocol,
        },
        balances,
        complex,
        {
          job,
          status: status_job.part[i],
          part: i++,
        }
      )
    );
  }

  try {
    const res = await Promise.all(arr);

    res.forEach((item) => {
      resultData.push(...item.data);
      resultFootnotes.push(...item.footnotes);
    });
  } catch (e) {
    console.log("get wallet cost basis error", e);
    return null;
  }

  //Sort results across chains, largest to smallest value
  resultData.sort((a, b) => (a.value > b.value ? -1 : 1));
  //console.log("Footnotes", resultFootnotes);
  return { footnotes: resultFootnotes, result: resultData };
}

//Mark "Borrow" transfers
//   For transactions that have:
//   Two transfers in same direction +
//   one of them is a coin being borrowed
//      (on borrow_coin_list in complex_protocol)
function markDebtTransfers(
  global_complex_protocol_debank,
  global_transfers,
  wallet
) {
  //Find coins being borrowed
  const portfolio_items = global_complex_protocol_debank.flatMap(
    (protocol) => protocol.portfolio_item_list
  );
  const portfolio_items_borrowing = portfolio_items.filter(
    (item) => item.detail.borrow_token_list
  );
  const borrow_tokens = portfolio_items_borrowing.flatMap(
    (item) => item.detail.borrow_token_list
  );
  const borrow_token_ids = borrow_tokens.flatMap((token) => token.id);

  //Loop through transfers in these coins
  const borrow_token_transfers = global_transfers.filter((xfer) =>
    borrow_token_ids.includes(xfer.address)
  );
  for (let i = 0; i < borrow_token_transfers.length; i++) {
    const tx = borrow_token_transfers[i].transaction_hash;
    const transfers_in_tx = global_transfers.filter(
      (xfer) => xfer.transaction_hash == tx
    );
    if (transfers_in_tx.length != 2) continue;
    const to_vault = transfers_in_tx.find(
      (xfer) => xfer.from_address == wallet
    );
    const from_vault = transfers_in_tx.find(
      (xfer) => xfer.to_address == wallet
    );
    if (to_vault && from_vault) continue;

    //If they fit the criteria, mark them as "borrow" transactions
    transfers_in_tx.forEach((xfer) => {
      xfer.type = "borrow";
    });
  }
  //Mark debt repayments as well: debt tokens withdrawn from wallet
  let debt_tokens = global_transfers
    .filter(
      (xfer) =>
        xfer.type == "borrow" && !borrow_token_ids.includes(xfer.address)
    )
    .map((xfer) => xfer.address);
  debt_tokens = [...new Set(debt_tokens)];
  const debt_repayments = global_transfers.filter(
    (xfer) => debt_tokens.includes(xfer.address) && xfer.from_address == wallet
  );
  debt_repayments.forEach((xfer) => {
    xfer.type = "borrow";
  });

  return global_transfers;
}

function prepTransfers(
  global_transfers,
  global_tx,
  global_complex_protocol_debank,
  chain,
  wallet
) {
  //Filter out compounding tokens
  // global_transfers = global_transfers.filter(
  //   (x) => !COMPOUNDING_TOKENS[x.address]
  // );

  //Convert strings to numbers
  for (let i = 0; i < global_transfers.length; i++) {
    global_transfers[i].value = BigInt(global_transfers[i]?.value);
    global_transfers[i].block_number = Number(
      global_transfers[i]?.block_number
    );
    global_transfers[i].to_address =
      global_transfers[i]?.to_address.toLowerCase();
    global_transfers[i].from_address =
      global_transfers[i]?.from_address.toLowerCase();
  }

  //Copy native inbound transfers
  global_transfers = inbound_native_transfers(global_transfers, chain, wallet);

  //Copy native outbound transfers to ERC20 transfers
  const native_xfers = global_tx.filter((xfer) => xfer.value > 0);
  for (let i = 0; i < native_xfers.length; i++) {
    const tx = native_xfers[i];

    global_transfers.push({
      address: chainCoins[chain].native_coin.toLowerCase(), //chainCoins[chain].address,
      block_hash: tx.block_hash,
      block_number: tx.block_number,
      block_timestamp: tx.block_timestamp,
      from_address: tx.from_address,
      to_address: tx.to_address,
      transaction_hash: tx.hash,
      value: BigInt(tx.value),
      gas: tx.gas,
      gas_price: tx.gas_price,
    });
  }

  //Add receipts for one-way vault deposits/withdrawals
  global_transfers = add_vault_transfers(
    chain,
    wallet,
    global_transfers,
    global_complex_protocol_debank
  );

  //Mark "Borrow" transfers
  transfers = markDebtTransfers(
    global_complex_protocol_debank,
    global_transfers,
    wallet
  );

  //Add isReceived
  for (let i = 0; i < global_transfers.length; i++) {
    global_transfers[i]["isReceived"] =
      global_transfers[i].to_address == wallet;
  }

  //Sort: Latest transactions first
  global_transfers = global_transfers.sort(Utils.sortBlockNumber_reverseChrono);

  console.log("global_transfers", global_transfers.length, chain);

  return global_transfers;
}

//Input: wallet vault / defi position from  debank + reference vaults from vfat tools
//Output: deposit address for vault
function getRefVault(wallet_vault, ref_assets) {
  let ref_vault = null;

  //Plan A: Match by pool key generated by debank_protocols/src/2a_analyze_debank.js
  ref_vault = ref_assets.find((v) => v.key == wallet_vault.key);
  if (ref_vault) return ref_vault;

  const ref_assets_chain_protocol = ref_assets.filter(
    (ref) =>
      ref.chain.toLowerCase() == wallet_vault.chain &&
      ref.protocol.toLowerCase() == wallet_vault.protocol_id
  );

  //Plan B: Match pool id directly
  if (wallet_vault.name == "Governance" || wallet_vault.name == "Locked") {
    ref_vault = ref_assets_chain_protocol.find(
      (ref) => ref.deposit_address == wallet_vault.pool_id.toLowerCase()
    );
  }

  //Plan C: Match on underlying tokens...
  if (!ref_vault) {
    ref_vault = ref_assets_chain_protocol.find(
      (ref) => ref.underlying_tokens_hash == wallet_vault.asset_hash
    );
  }

  //Plan D: Match on deposit tokens...
  if (!ref_vault) {
    ref_vault = ref_assets_chain_protocol.find(
      (ref) => ref.deposit_tokens_hash == wallet_vault.asset_hash
    );
  }

  return ref_vault;
}

//Prep reference vaults
function getGlobalVaults(chain) {
  //TODO: Move this to run when server starts
  let ref_assets = REF_ASSETS.filter(
    (item) => item.chain.toLowerCase() == chain
  );
  for (let i = 0; i < ref_assets.length; i++) {
    // console.log(i);
    // if (i == 86) {
    //   console.log("breakpt");
    // }
    if (ref_assets[i].deposit_tokens) {
      let deposit_tokens_hash = ref_assets[i].deposit_tokens.map((asset) =>
        asset.address.toLowerCase()
      );
      deposit_tokens_hash = deposit_tokens_hash.sort().join("|");
      ref_assets[i]["deposit_tokens_hash"] = deposit_tokens_hash;
    }

    if (ref_assets[i].underlying_tokens) {
      let underlying_tokens_hash = ref_assets[i].underlying_tokens.map(
        (asset) => asset.address?.toLowerCase()
      );
      underlying_tokens_hash = underlying_tokens_hash.sort().join("|");
      ref_assets[i]["underlying_tokens_hash"] = underlying_tokens_hash;
    }
  }
  return ref_assets;
}

function getLPToken(pool, global_token_info_debank) {
  let lp_token_debank = null;
  if (!pool.pool_id) return null;
  //Plan A. Find using pool_id
  lp_token_debank = global_token_info_debank.find(
    (token) => token.id == pool.pool_id
  );
  if (lp_token_debank) return lp_token_debank;

  //Plan B. Find using vault's receipt token
  let ref_vault = REF_ASSETS.find(
    //Match key and deposit address. Some keys have multiple deposit addresses
    (ref) => ref.key == pool.key && ref.deposit_address == pool.pool_id
  );
  if (!ref_vault)
    //Rari: match only key
    ref_vault = REF_ASSETS.find((ref) => ref.key == pool.key);
  if (ref_vault && ref_vault.receipt_token)
    lp_token_debank = global_token_info_debank.find(
      (token) => token.id == ref_vault.receipt_token
    );
  return lp_token_debank;
}

//Defi vault positions in wallet
function prepWalletVaults(
  global_complex_protocol_debank,
  global_token_info_debank,
  global_balances,
  chain
) {
  let wallet_vaults = [];
  const complex = global_complex_protocol_debank.filter(
    (item) => item.chain == chain
  );

  const ref_assets = getGlobalVaults(chain);

  //Export complex_protocol into searchable vaults
  for (const complex_protocol_item of complex) {
    const portfolio_item_list = complex_protocol_item.portfolio_item_list;

    for (const pool of portfolio_item_list) {
      if (!pool.detail.supply_token_list) continue;
      if (pool.stats.net_usd_value == 0) continue;

      //Normally, we process supply_token_list and ignore rewards, BUT:
      //  Wallet 0xDcAa90D9F3b75cDa80764326f6594b58d0585d21 shows Bancor rewards with
      //  detail.supply_token_list instead of detail.reward_token_list because
      //  the wallet does not have a main position left in protocol bancor (only in bancor3)
      if (pool.name == "Rewards") continue;

      // For lending protocold:
      //    If there's one underlying token, process the defi position instead of the token
      //    If >1, process each token instead of the defi position
      if (
        isDebtProtocol(complex_protocol_item.id) &&
        pool.detail.supply_token_list.length > 1
      )
        continue;

      //Boilerplate, do for all pools
      pool.positionType = "vault";
      pool.chain = chain; //TODO: Moralis chain or DeBank chain?
      pool.protocol_id = complex_protocol_item.id;
      pool.value = pool.stats.net_usd_value;
      const supply_tokens = pool.detail.supply_token_list.map(
        (token) => token.id
      );
      pool.asset_hash = supply_tokens.sort().join("|");
      pool.key = poolKey(complex_protocol_item, pool);

      //Plan A: Look for matching LPs coins in wallet
      const lp_token_debank = getLPToken(pool, global_token_info_debank);

      if (lp_token_debank) {
        //Found matching token in wallet
        pool.lp_token = lp_token_debank;
        lp_token_debank.used = true;
        pool.id = lp_token_debank.id;
        const lp_token_moralis = global_balances.find(
          (token) => token.token_address == pool.pool_id
        );
        pool.raw_amount =
          lp_token_moralis?.balance || lp_token_debank.raw_amount;
      } else {
        //Plan B: Match pool vs reference vault in JSON
        //        Vault does not give a token receipt: Search history by deposit address + maybe deposit token
        const ref_vault = getRefVault(pool, ref_assets);
        pool.id = ref_vault?.deposit_tokens[0].address.toLowerCase() || null;
        pool.deposit_address =
          ref_vault?.deposit_address?.toLowerCase() || null;
        if (ref_vault) pool.raw_amount = BigInt(1e30);
      }

      wallet_vaults.push(pool);
    }
  }
  //Sort wallet_vaults by value, descending,
  //  so that larger positions get marked "used" first by the cost basis algo
  wallet_vaults.sort((a, b) => (a.value > b.value ? -1 : 1));
  return wallet_vaults;
}

//Combine defi vault positions with token wallets into 1 list
function prepWallet(
  global_token_info_debank,
  global_complex_protocol_debank,
  global_balances,
  chain
) {
  //1. Defi vaults
  let wallet_vaults = prepWalletVaults(
    global_complex_protocol_debank,
    global_token_info_debank,
    global_balances,
    chain
  );

  //2. Tokens in wallet
  let wallet_tokens = global_token_info_debank.filter(
    (token) =>
      (token.is_verified || token.protocol_id != "") && token.used == undefined //&& position.is_wallet
  ); //is_verified => Skip spam tokens.
  //token.used=true means token matches an LP token in a vault

  for (const token of wallet_tokens) {
    token.positionType = "token";
    token.value = token.price * token.amount;
    if (!token.protocol_id) {
      const wrapped_token = debank_wrapped_tokens.find(
        (wrap) =>
          (wrap.asset.includes(token.id) || wrap.debt.includes(token.id)) &&
          wrap.chain == chain
      );
      if (wrapped_token) token.protocol_id = wrapped_token.protocol;
    }
  }

  return [...wallet_vaults, ...wallet_tokens];
}

function bidirectional(chain, wallet, tx, global_transfers) {
  const chainDebank = chainCoins[chain].chainId;
  const to_vault = global_transfers.find(
    (xfer) =>
      xfer.transaction_hash == tx.transaction_hash &&
      xfer.from_address == wallet
  );

  const from_vault = global_transfers.find(
    (xfer) =>
      xfer.transaction_hash == tx.transaction_hash &&
      xfer.to_address == wallet &&
      //Exclude reward tokens coming back to wallet from vault
      !debank_reward_tokens[chainDebank].includes(xfer.address)
    //TODO: MoralisChain or DebankChain?
  );
  return to_vault && from_vault;
}

function add_vault_transfers(
  chain,
  wallet,
  global_transfers,
  global_complex_protocol_debank
) {
  let lp_tokens = [];
  let vaults = [];
  //1. Find LP tokens + vaults in reference farms
  const vaults_in_chain = REF_ASSETS.filter(
    (vault) => vault.chain.toLowerCase() == chainCoins[chain].chainId
  );
  for (const vault of vaults_in_chain) {
    if (
      vault.key &&
      (vault.key.includes(",Farming,") ||
        vault.key.includes(",Staked,") ||
        vault.key.includes(",avax_abracadabra,Lending,"))
    ) {
      if (vault.deposit_tokens.length > 1)
        console.log(
          "Warning: vault.deposit_tokens.length>1",
          JSON.stringify(vault)
        );
      // if (
      //   vault.underlying_tokens?.length > 0 &&
      //   vault.underlying_tokens[0].address.toLowerCase() ==
      //     vault.deposit_tokens[0].address.toLowerCase()
      // )
      //   continue;
      lp_tokens.push(vault.deposit_tokens[0].address.toLowerCase());
      vaults.push(vault.deposit_address.toLowerCase());
    }
  }
  //2. Add LP tokens in wallet
  const complex = global_complex_protocol_debank.filter(
    (item) => item.chain == chainCoins[chain].chainId
  );
  for (const complex_protocol_item of complex) {
    for (const pool of complex_protocol_item.portfolio_item_list) {
      if (pool.name == "Liquidity Pool") lp_tokens.push(pool.pool_id);
    }
  }
  lp_tokens = [...new Set(lp_tokens)];
  vaults = [...new Set(vaults)];

  const candidate_transfers = global_transfers.filter(
    (xfer) =>
      (vaults.includes(xfer.from_address) ||
        vaults.includes(xfer.to_address) ||
        lp_tokens.includes(xfer.address)) &&
      //Ignore rewards received from vaults
      !(
        xfer.to_address == wallet &&
        reward_tokens[chainCoins[chain].chainId].includes(xfer.address)
      )
  );

  for (tx of candidate_transfers) {
    //Create a vault receipt if ONE of these is true:
    //   a. one-sided transfer / any token / to a known vault OR
    //   c. one-sided transfer / LP token / to any address.
    //        Example: Vault is not in JSON, but LP is in wallet, like VISION/ETH
    //  TODO: Check Sushi farming. reward token should be ignored.
    const isVault =
      vaults.includes(tx.from_address) || vaults.includes(tx.to_address);
    const isLP = lp_tokens.includes(tx.address);
    const one_sided = !bidirectional(chain, wallet, tx, global_transfers);
    if ((one_sided && isVault) || (one_sided && isLP)) {
      const vault_address =
        tx.to_address == wallet ? tx.from_address : tx.to_address;
      global_transfers.push({
        address: tx.address, //vault_address,
        block_hash: tx.block_hash,
        block_number: tx.block_number,
        block_timestamp: tx.block_timestamp,
        from_address: tx.to_address == wallet ? wallet : vault_address,
        to_address: tx.to_address == wallet ? vault_address : wallet,
        isReceived: !tx.isReceived,
        transaction_hash: tx.transaction_hash,
        value: BigInt(1), //placeholder unit
        type: "vault",
      });
    }
  }
  //After adding some transfers, sort reverse chronologically
  global_transfers = global_transfers.sort(Utils.sortBlockNumber_reverseChrono);
  return global_transfers;
}

function portfolioValue(positions) {
  const defi_positions = positions
    .filter((x) => x.positionType == "vault")
    .map((x) => x.value);
  const token_positions = positions
    .filter((x) => x.positionType == "token" && !x.used)
    .map((x) => x.price * x.amount);
  let sum = Number(0);
  for (const position of [...defi_positions, ...token_positions]) {
    sum = sum + Number(position);
  }
  return sum;
}

async function getWalletCostBasis(
  data,
  global_token_info_debank,
  global_complex_protocol_debank,
  { job, status, part }
) {
  console.log("getWalletCostBasis:", data);
  const chainMoralis = data.chain;
  const chainDebank = chainCoins[data.chain].chainId;
  //const chain_blockheight = await getCurrentBlockNumber(data.chain);
  let sTime = new Date().getTime();
  //Get global data
  const result = await Promise.all([
    getTokenBalances(chainMoralis, data.wallet),
    getTokenTransfers(chainMoralis, data.wallet),
    getTransactions(chainMoralis, data.wallet),
  ]);
  timeCost.getTransData.timeCost += new Date().getTime() - sTime;
  timeCost.getTransData.count += 1;

  let global_balances = result[0];
  let global_transfers = result[1];
  const global_tx = result[2]?.transactions;

  const gb_transfer_tx_ids = [];
  global_transfers.map((transfer) => {
    if (!gb_transfer_tx_ids.includes(transfer.transaction_hash)) {
      gb_transfer_tx_ids.push(transfer.transaction_hash);
    }
  });
  const global_tx_count = result[2]?.txCount;
  const lastTxDate =
    global_transfers[global_transfers.length - 1]?.block_timestamp;
  const transfer_tx_count = gb_transfer_tx_ids.length;

  global_transfers = prepTransfers(
    global_transfers,
    global_tx,
    global_complex_protocol_debank,
    chainMoralis,
    data.wallet
  );

  const global_supply_tokens_debank = getSupplyTokens(
    global_complex_protocol_debank
  );

  //If token specified in request, just do that token instead of the whole wallet
  if (data.token) {
    global_balances = global_balances.filter(
      (each) => each.token_address == data.token
    );
  }

  //Set up for positions loop
  let returnData = [];
  let wallet_positions = prepWallet(
    global_token_info_debank,
    global_complex_protocol_debank,
    global_balances,
    chainDebank
  );

  const wallet_value_in_chain = portfolioValue(wallet_positions);

  //Loop through wallet balances, get value + cost basis
  //TODO: Make this loop asynchronous using Promise.all

  wallet_positions = wallet_positions.filter(
    (item) =>
      !item.protocol_id ||
      !data.jobProtocol ||
      item.protocol_id === data.jobProtocol
  );

  for (let i = 0; i < wallet_positions.length; i++) {
    const wallet_position = wallet_positions[i];
    //if (wallet_position.protocol_id != "avax_aave3") continue;
    let tokenHistory = null;
    sTime = new Date().getTime();
    tokenHistory = await getTokenCostBasis(
      chainMoralis,
      null, //blockheight
      data.wallet,
      wallet_position,
      wallet_position.id, // token address
      BigInt(wallet_position?.raw_amount || 0), //balance
      wallet_position.deposit_address, //for vaults only
      1, // hierarchy_level
      {}, // parent_transaction,
      global_supply_tokens_debank,
      global_transfers,
      global_tx,
      global_token_info_debank,
      wallet_value_in_chain
    );
    timeCost.tokenCostBasis.timeCost += new Date().getTime() - sTime;
    timeCost.tokenCostBasis.count += 1;

    //Build main table
    sTime = new Date().getTime();
    let token_result = await makeTokenResult(
      i,
      chainMoralis,
      wallet_position,
      tokenHistory,
      global_token_info_debank,
      global_complex_protocol_debank
    );
    timeCost.makeTokenResult.timeCost += new Date().getTime() - sTime;
    timeCost.makeTokenResult.count += 1;

    returnData.push(token_result);
    if (status) {
      const progress = await job.progress();
      status.current = i + 1;
      status.total = wallet_positions.length;
      status.ready = true;
      progress[part] = status;
      job.progress(progress);
    }
  }

  console.log(timeCost);

  const footnote = [
    {
      chain: chainMoralis,
      totalTxCount: global_tx_count,
      currentTxCount: transfer_tx_count,
      lastTxDate: lastTxDate,
    },
  ];

  let returnResult = {
    footnotes: footnote,
    data: returnData,
  };
  //Sort by value, descending
  return returnResult;
}

//Look for underlying defi asset matching a wallet token
async function getAssetsFromComplex(
  chain,
  wallet_position,
  global_complex_protocol_debank,
  global_token_info_debank
) {
  let assets = null;
  const wrapped_token = debank_wrapped_tokens.find(
    (wrap) =>
      (wrap.asset.includes(wallet_position.id) ||
        wrap.debt.includes(wallet_position.id)) &&
      wrap.chain == chainCoins[chain].chainId
  );
  if (!wrapped_token) return null;

  const matching_protocol = global_complex_protocol_debank.find(
    (complex_protocol) => complex_protocol.id == wallet_position.protocol_id
  );
  if (!matching_protocol) return null;

  //Export complex_protocol into searchable vaults
  for (const pool of matching_protocol.portfolio_item_list) {
    let underlying_candidates = [];
    if (pool.detail.borrow_token_list) {
      underlying_candidates.push(
        ...pool.detail.borrow_token_list.map((token) => token.id)
      );
    }
    if (pool.detail.supply_token_list) {
      underlying_candidates.push(
        ...pool.detail.supply_token_list.map((token) => token.id)
      );
    }
    if (underlying_candidates.includes(wrapped_token.underlying)) {
      const token_info = await get_debank_token(
        chain,
        wrapped_token.underlying,
        global_token_info_debank
      );
      assets = [
        {
          id: wrapped_token.underlying,
          ticker: wrapped_token.symbol,
          logo: token_info?.logo_url || null,
        },
      ];
      return assets;
    }
  }
}

async function getAssets(
  chain,
  wallet_position,
  tokenHistory,
  global_complex_protocol_debank,
  global_token_info_debank
) {
  let assets = null;
  const debank_protocol = debank_protocol_ref.find(
    (protocol) => protocol.id == wallet_position.protocol_id
  );

  //Plan B: Defi underlying assets, from DeBank, direct
  if (
    !assets &&
    wallet_position.detail &&
    wallet_position.detail.supply_token_list
  ) {
    assets = [];
    for (const asset of wallet_position.detail.supply_token_list) {
      if (asset.id && asset.optimized_symbol && asset.logo_url)
        assets.push({
          id: asset.id,
          ticker: asset.optimized_symbol,
          logo: asset.logo_url,
        });
      else {
        const token_info = await get_debank_token(
          chain,
          asset.id,
          global_token_info_debank
        );
        assets.push({
          id: asset.id,
          ticker: token_info.optimized_symbol,
          logo: token_info.logo_url,
        });
      }
    }
    // assets = wallet_position.detail.supply_token_list.map((asset) => ({
    //   id: asset.id,
    //   ticker: asset.optimized_symbol,
    //   logo: asset.logo_url,
    // }));
  }

  //Plan C: Defi underlying assets, from DeBank, indirect: search complex_protocol
  if (!assets && wallet_position.protocol_id) {
    assets = await getAssetsFromComplex(
      chain,
      wallet_position,
      global_complex_protocol_debank,
      global_token_info_debank
    );
  }

  //Look for underlying tokens
  if (!assets) {
    const wrapped_token = debank_wrapped_tokens.find(
      (wrap) =>
        (wrap.asset.includes(wallet_position.id) ||
          wrap.debt.includes(wallet_position.id)) &&
        wrap.chain == chainCoins[chain].chainId
    );
    if (wrapped_token) {
      const token_info = await get_debank_token(
        chain,
        wrapped_token.underlying,
        global_token_info_debank
      );
      assets = [
        {
          id: wrapped_token.underlying,
          ticker: wrapped_token.symbol,
          logo: token_info?.logo_url || null,
        },
      ];
    }
  }

  //Plan A: Wallet coin is its own asset
  if (!assets && (wallet_position.is_core || !wallet_position.protocol_id)) {
    assets = [
      {
        id: wallet_position.id,
        ticker: wallet_position.symbol,
        logo: wallet_position?.logo_url || debank_protocol?.logo_url || null,
      },
    ];
  }

  //Plan D: Guess underlying asset from history
  //TODO: pass in JSON_CURVE and find the assets from 3CRV to underlying.
  if (!assets) {
    assets = await getAssetsFromHistory(
      chain,
      tokenHistory.history,
      global_token_info_debank
    ); //Copy liquid assets from tree here
  }

  return assets;
}

async function makeTokenResult(
  i,
  chain,
  wallet_position,
  tokenHistory,
  global_token_info_debank,
  global_complex_protocol_debank
) {
  const isWallet =
    wallet_position.is_core ||
    (!wallet_position.protocol_id && !wallet_position.price);

  let token_result = {
    id: "p" + i,
    chain: chain,
    chain_id: 123, //TODO: Chain ID
    chain_logo: debank_chain_details[chain].logo_url,
    type: isWallet ? "Wallet" : "Yield",
    name: wallet_position?.name,
    type_img: wallet_position.is_wallet
      ? "../assets/images/wallet.jpg"
      : "../assets/images/yield.jpg",
    units: wallet_position.amount,
    value:
      wallet_position.value || wallet_position.amount * wallet_position.price,
    cost_basis: tokenHistory.cost_basis,
    history: isWallet ? null : tokenHistory.history,
  };

  //If no history, guess cost from value
  if (
    tokenHistory.cost_basis == 0 &&
    tokenHistory.history.length == 0 &&
    token_result.value > 0
  ) {
    token_result.cost_basis = token_result.value;
    token_result.guess_cost_from_vault = true;
  }

  //Protocol column
  let debank_protocol = null;
  if (wallet_position.protocol_id) {
    debank_protocol = debank_protocol_ref.find(
      (complex_protocol) => complex_protocol.id == wallet_position.protocol_id
    );
    token_result.protocol_id = wallet_position.protocol_id;
    token_result.protocol = debank_protocol?.name || null;
    token_result.protocol_logo = debank_protocol?.logo_url || null;
    token_result.protocol_url = debank_protocol?.site_url || null;
  }

  //Underlying assets column
  token_result.assets = await getAssets(
    chain,
    wallet_position,
    tokenHistory,
    global_complex_protocol_debank,
    global_token_info_debank
  );

  //Value column
  // If value is blank, fill it in from debank complex protocol api
  if (
    token_result.value == 0 &&
    wallet_position.protocol_id &&
    debank_protocol
  ) {
    if (
      token_result.cost_basis < 0 &&
      isDebtProtocol(wallet_position.protocol_id)
    ) {
      token_result.value = await getDebtValue(
        chain,
        wallet_position,
        token_result.assets,
        global_complex_protocol_debank,
        global_token_info_debank
      );
    } else {
      token_result.value = getDebankValue(
        wallet_position.id,
        debank_protocol,
        token_result.assets,
        global_complex_protocol_debank
      );
    }
  }
  return token_result;
}

function isDebtProtocol(protocol_id) {
  const protocol = debank_protocol_tags.data.find(
    (debank_protocol) => debank_protocol.id == protocol_id
  );
  if (!protocol) return false;
  const exceptions = ["avax_abracadabra"];
  if (exceptions.includes(protocol.id)) {
    return false;
  }
  const isDebt = protocol.tag_ids.includes("debt");
  return isDebt;
}

async function getDebtValue(
  chain,
  wallet_position,
  assets,
  global_complex_protocol_debank,
  global_token_info_debank
) {
  let borrow_token; //so that the variable works outside the try{} block
  const borrowed_asset_id = assets[0].id; //What if >1 asset is borrowed?
  const lending_protocol = global_complex_protocol_debank.filter(
    (protocol) => protocol.id == wallet_position.protocol_id
  );

  //Find coins being borrowed in complex protocol
  try {
    const portfolio_items = lending_protocol.flatMap(
      (protocol) => protocol.portfolio_item_list
    );
    const borrow_tokens = portfolio_items.flatMap(
      (item) => item.detail.borrow_token_list
    );
    borrow_token = borrow_tokens.find((token) => token.id == borrowed_asset_id);
    const amount = borrow_token.amount;
  } catch (error) {
    console.log("getDebtValue: No borrowed tokens found");
    return 0;
  }

  const price = await getTokenPrice(
    chain,
    borrow_token.id,
    null, // _toBlock,
    global_token_info_debank
  );
  const debt_value = borrow_token.amount * price * -1; //negative cost = credit to account
  return debt_value;
}

function historyNode(
  chain,
  units,
  parent_transaction,
  token,
  token_info,
  wallet_position,
  price,
  hierarchy_level
) {
  const history_node = {
    units,
    transaction_id: parent_transaction.transaction_hash,
    transaction_url: `${chainCoins[chain].explorer}/${parent_transaction.transaction_hash}`,
    datetime: Utils.convertDateTime(parent_transaction.block_timestamp),
    token_id: token,
    token_name:
      token_info?.name ||
      debank_protocol_ref.filter(
        (protocol) => protocol.id == wallet_position.protocol_id
      )[0]?.name + " vault receipt",
    token_symbol: token_info?.symbol || "<Unknown symbol>",
    token_img: token_info?.logo_url || null,
    fee_native_coin: chainCoins[chain].native_coin,
    cost_basis: units * price,
    hierarchy_level,
    valued_directly: true,
  };
  return history_node;
}

async function getTokenCostBasis(
  chain,
  block,
  wallet,
  wallet_position,
  token,
  balance,
  deposit_address, //for vaults only
  hierarchy_level,
  parent_transaction,
  global_supply_tokens_debank,
  global_transfers,
  global_tx,
  global_token_info_debank,
  wallet_value_in_chain,
  reverse = true
) {
  const blockheight = block?.block_number;
  if (MODE_SETTING === "dev") {
    console.log(
      "CostBasis: (L/token/block/tx/bal)",
      " ".repeat(hierarchy_level),
      hierarchy_level,
      token?.slice(-4) || null,
      blockheight,
      Utils.isEmpty(parent_transaction)
        ? "--"
        : parent_transaction.transaction_hash.slice(-4),
      balance
    );
  }

  let token_cost = 0,
    current_balance = BigInt(balance),
    token_info = null,
    price = null,
    newHistory = [];
  let sTime;
  //Get token price

  if (!deposit_address && token) {
    sTime = new Date().getTime();
    token_info = await get_debank_token(chain, token, global_token_info_debank);
    timeCost.get_debank_token.timeCost += new Date().getTime() - sTime;
    timeCost.get_debank_token.count += 1;
    token_info.decimals = token_info?.decimals || 18;
    if (blockheight) {
      //historical price
      sTime = new Date().getTime();
      price = await getTokenPrice(
        chain,
        token,
        blockheight,
        global_token_info_debank,
        token_info,
        FAST_MODE
      );
      timeCost.ercTokenPrice.timeCost += new Date().getTime() - sTime;
      timeCost.ercTokenPrice.count += 1;
    } else {
      //current price
      price = token_info.price;
    }
  }

  //Price reality check
  //   If units * price >10x total value of the wallet,
  //    it's probably an incorrect price. Try another pricing source.
  if (
    (Number(balance) / 10 ** (token_info?.decimals || 18)) * price >
    wallet_value_in_chain * 10
  )
    price = null;

  //Wrapped token? Get price of the underlying
  if (hierarchy_level > 1 && !price && !token_info?.is_core) {
    const wrapped_token = debank_wrapped_tokens.find(
      (wrap) =>
        (wrap.asset.includes(token) || wrap.debt.includes(token)) &&
        wrap.chain == chainCoins[chain].chainId
    );
    if (wrapped_token) {
      price = await getTokenPrice(
        chain,
        wrapped_token.underlying,
        blockheight,
        global_token_info_debank,
        token_info,
        FAST_MODE
      );
      if (MODE_SETTING === "dev") {
        console.log(
          `   Wrapped: ${token_info?.name || token}, Underlying: ${
            wrapped_token?.symbol
          }, Block, ${blockheight}, Price: ${price}`
        );
      }
    }
  }

  //Get Covalent price
  if (!price && token_info?.is_core && hierarchy_level > 1)
    price = await getCovalentPrice(
      chain,
      token,
      token_info?.optimized_symbol,
      block,
      wallet
    );

  //Is this one of the underlying tokens?
  const is_supply_token = global_supply_tokens_debank.includes(token);
  const units = Number(balance) / 10 ** (token_info?.decimals || 18);

  //Liquid tokens
  if (
    (Math.abs(units * price) < 1 && price > 0) || //small position
    (hierarchy_level == 1 && token_info && token_info.is_core) || //wallet token
    (hierarchy_level == 2 &&
      price &&
      (token_info.is_core ||
        is_supply_token ||
        //token_info.debank_not_found ||
        parent_transaction.type == "borrow")) || //|| parent_transaction.type == "vault")
    (hierarchy_level > 2 && price)
  ) {
    if (!Utils.isEmpty(parent_transaction)) {
      const hist_node = historyNode(
        chain,
        units,
        parent_transaction,
        token,
        token_info,
        wallet_position,
        price,
        hierarchy_level
      );
      newHistory.push(hist_node);
    }
    return { cost_basis: units * price, history: newHistory };
  }

  // Non-wallet tokens

  // retrieve list of token transactions to/from wallet, prior to block
  let token_transactions = global_transfers.filter(
    (xfer) =>
      (Utils.isEmpty(parent_transaction) ? true : xfer.isReceived == reverse) && //In L2+, look for only buys or only sells
      xfer.address == token?.toLowerCase() &&
      xfer.used == undefined &&
      xfer.value > 0 &&
      (reverse
        ? Number(xfer.block_number) <= Number(blockheight || 1e20)
        : Number(xfer.block_number) >= Number(blockheight || 1e20))
  );
  if (deposit_address) {
    token_transactions = token_transactions.filter(
      (xfer) =>
        xfer.type == "vault" && //TODO: Check how this works on curve wallets, where we needed vaults.
        (xfer.to_address == deposit_address ||
          xfer.from_address == deposit_address)
    );
  }

  //Sort deposits back in time, withdrawals forward in time
  if (!reverse) {
    token_transactions = token_transactions.sort(Utils.sortBlockNumber_Chrono);
  }

  if (token_transactions.length == 0 && !Utils.isEmpty(parent_transaction)) {
    //Dead end: Write a history entry with price=0
    //The rest of the loop will be skipped.
    const hist_node = historyNode(
      chain,
      units,
      parent_transaction,
      token,
      token_info,
      wallet_position,
      price,
      hierarchy_level
    );
    newHistory.push(hist_node);
  }

  //Faster debugging: Limit to 5 tx per position
  // token_transactions = token_transactions.slice(0, 5);

  let nativePrice;
  if (FAST_MODE == true && token_transactions.length > 0) {
    sTime = new Date().getTime();
    nativePrice = await getTokenPrice(
      chain,
      chainCoins[chain].address,
      null,
      global_token_info_debank,
      FAST_MODE
    );
    timeCost.nativeCoinPrice.timeCost += new Date().getTime() - sTime;
    timeCost.nativeCoinPrice.count += 1;
  }
  // For each transaction
  for (let i = 0; i < token_transactions.length; i++) {
    const transaction = token_transactions[i];

    //transaction might be marked used in recursive calls
    if (transaction.used) continue;
    else transaction.used = true;

    let transaction_cost = 0,
      used_pct = 1;

    const transaction_detail =
      global_tx.filter((tx) => tx.hash === transaction.transaction_hash)[0] ||
      {};

    //calculate the balance of token in wallet, just before transaction.
    const isReceived = transaction.isReceived;
    const units_received = transaction.value * (isReceived ? 1n : -1n);
    if (isReceived && current_balance < transaction.value) {
      used_pct = Number(current_balance) / Number(transaction.value);
      current_balance = 0;
    } else {
      used_pct = 1;
      current_balance = current_balance - units_received;
    }

    // calculate the cost basis of current transaction, starting w/offseting coins
    let offsetting_coins = global_transfers.filter(
      (xfer) =>
        xfer.transaction_hash == transaction.transaction_hash &&
        xfer.used == undefined &&
        (transaction.type == "borrow" ? true : xfer.isReceived != isReceived)
      //For normal transactions, offsetting transfers is in opposite direction (!isReceive)
      //For borrow transactions, it's in the same direction
    );

    //If coin was sent, sort chronological to look for future dispositions
    if (!isReceived && offsetting_coins.length > 1) {
      offsetting_coins = offsetting_coins.sort(Utils.sortBlockNumber_Chrono);
    }

    let childHistory = [];

    for (let j = 0; j < offsetting_coins.length; j++) {
      const offsetting_coin = offsetting_coins[j];
      offsetting_coin.used = true;
      let offsetting_coin_units =
        offsetting_coin.value *
        (isReceived ? 1n : -1n) *
        (transaction.type == "borrow" ? -1n : 1n);
      //  For borrow transactions: debt and borrowed token move in same direction
      if (used_pct < 1) {
        offsetting_coin_units = Number(offsetting_coin_units) * used_pct;
        offsetting_coin_units = BigInt(Math.round(offsetting_coin_units));
      }
      let offsetting_deposit_address = null;
      if (offsetting_coin.type == "vault") {
        offsetting_deposit_address =
          offsetting_coin.to_address == wallet
            ? offsetting_coin.from_address
            : offsetting_coin.to_address;
      }

      const CostBasisResult = await getTokenCostBasis(
        chain,
        offsetting_coin,
        wallet,
        wallet_position,
        offsetting_coin.address,
        offsetting_coin_units, //balances
        offsetting_deposit_address, //deposit_address, for vaults only
        hierarchy_level + 1,
        transaction, // parent transaction (transfer)
        global_supply_tokens_debank,
        global_transfers,
        global_tx,
        global_token_info_debank,
        wallet_value_in_chain,
        isReceived
      );
      transaction_cost = transaction_cost + CostBasisResult.cost_basis;

      childHistory = childHistory.concat(CostBasisResult.history);
    }

    token_cost = token_cost + transaction_cost;

    let native_price;
    if (FAST_MODE) {
      native_price = nativePrice;
    } else {
      sTime = new Date().getTime();
      native_price = await getTokenPrice(
        chain,
        chainCoins[chain].address,
        blockheight,
        global_token_info_debank
      );
      timeCost.nativeCoinPrice.timeCost += new Date().getTime() - sTime;
      timeCost.nativeCoinPrice.count += 1;
    }
    sTime = new Date().getTime();

    const native_token_info = await get_debank_token(
      chain,
      chainCoins[chain].address,
      global_token_info_debank
    );
    timeCost.get_debank_token.timeCost += new Date().getTime() - sTime;
    timeCost.get_debank_token.count += 1;
    const fee_native_units =
      (transaction_detail.gas * transaction_detail.gas_price) /
      10 ** (native_token_info?.decimals || 18);
    let units = Number(units_received) / 10 ** (token_info?.decimals || 18);
    if (used_pct < 1) {
      units = Number(units) * used_pct;
      units = Math.round(units);
    }

    newHistory.push({
      units: units,
      transaction_id: transaction.transaction_hash,
      transaction_url: `${chainCoins[chain].explorer}/${transaction.transaction_hash}`,
      datetime: Utils.convertDateTime(transaction.block_timestamp),
      token_id: token,
      token_name:
        token_info?.name ||
        debank_protocol_ref.filter(
          (protocol) => protocol.id == wallet_position.protocol_id
        )[0]?.name + " vault receipt",
      token_symbol: token_info?.symbol,
      token_img:
        token_info?.logo_url ||
        debank_protocol_ref.filter(
          (p) => p.id == token_info?.protocol_id || 0
        )[0]?.logo_url ||
        null,
      fee_native_coin: chainCoins[chain].native_coin,
      fee_native_units: fee_native_units,
      fee_usd: fee_native_units * native_price || 0,
      cost_basis: transaction_cost,
      used_pct: used_pct,
      hierarchy_level: hierarchy_level,
      valued_directly: false,
      child: childHistory,
    });

    if (current_balance <= 0) break;
  } //end token transaction loop

  return { cost_basis: token_cost, history: newHistory };
}

//Log eth withdrawals from AAVE: aWETH outbound, ETH inbound
function inbound_native_transfers(transfers, chain, wallet) {
  const native_coin = chainCoins[chain].native_coin;
  const native_coin_wrapped = chainCoins[chain].address;
  const native_coin_1to1_matches = debank_wrapped_tokens
    .filter(
      (w) =>
        w.chain == chainCoins[chain].chainId &&
        w.protocol.includes("aave") &&
        (w.underlying == native_coin || w.underlying == native_coin_wrapped)
    )
    .flatMap((w) => w.asset);
  const inbound_xfers = transfers.filter(
    (xfer) =>
      native_coin_1to1_matches.includes(xfer.address) &&
      xfer.from_address == wallet
  );

  for (const xfer of inbound_xfers) {
    transfers.push({
      address: chainCoins[chain].address, //WETH transfer
      block_hash: xfer.block_hash,
      block_number: xfer.block_number,
      block_timestamp: xfer.block_timestamp,
      from_address: xfer.to_address, //from AAVE ETH Router
      to_address: wallet, //to wallet
      transaction_hash: xfer.transaction_hash,
      value: xfer.value,
      type: "inbound_native",
    });
  }

  return transfers;
}

module.exports = {
  getWalletsCostHistory,
};

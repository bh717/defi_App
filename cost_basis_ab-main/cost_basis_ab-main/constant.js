const apiKeys = [
  "xgqbsMJcRSDBv3QJRDhKKb1O3FQmPNR2SFICj3XpbXFizRmuFVIkWUnJe6msefX3", //Paid Moralis account
];

// common data
const chainCoins = {
  /*eth: {
    chainId: "eth",
    name: "Wrapped Ether",
    decimals: 18,
    symbol: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    native_coin: "ETH",
    explorer: "https://etherscan.com/tx",
    name_network: "Ethereum",
    priceStep: 100
  }*/
  polygon: {
    chainId: "matic",
    name: "Wrapped Matic",
    decimals: 18,
    symbol: "WMATIC",
    address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    native_coin: "MATIC",
    explorer: "https://polygonscan.com/tx",
    name_network: "Polygon",
    priceStep: 300,
  },
  eth: {
    chainId: "eth",
    name: "Wrapped Ether",
    decimals: 18,
    symbol: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    native_coin: "ETH",
    explorer: "https://etherscan.com/tx",
    name_network: "Ethereum",
    priceStep: 100,
  },
  bsc: {
    chainId: "bsc",
    name: "Wrapped BNB",
    decimals: 18,
    symbol: "WBNB",
    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    native_coin: "BSC",
    explorer: "https://bscscan.com/tx",
    name_network: "Binance Smart Chain",
    priceStep: 300,
  },
  fantom: {
    chainId: "ftm",
    name: "Wrapped FTM",
    decimals: 18,
    symbol: "WFTM",
    address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    native_coin: "FTM",
    explorer: "https://ftmscan.com/tx",
    name_network: "Fantom",
    priceStep: 1000,
  },
  avalanche: {
    chainId: "avax",
    name: "Wrapped AVAX",
    decimals: 18,
    symbol: "WAVAX",
    address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    native_coin: "AVAX",
    explorer: "https://snowtrace.io/tx",
    name_network: "Avalanche",
    priceStep: 300,
  },
};

const debank_chain_details = {
  eth: {
    id: "eth",
    community_id: 1,
    name: "Ethereum",
    native_token_id: "eth",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/eth/42ba589cd077e7bdd97db6480b0ff61d.png",
    wrapped_token: {
      name: "Wrapped Ether",
      decimals: 18,
      symbol: "WETH",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
  },
  bsc: {
    id: "bsc",
    community_id: 56,
    name: "BSC",
    native_token_id: "bsc",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/bsc/7c87af7b52853145f6aa790d893763f1.png",
    wrapped_token: {
      name: "Wrapped BNB",
      decimals: 18,
      symbol: "WBNB",
      address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    },
  },
  xdai: {
    id: "xdai",
    community_id: 100,
    name: "xDai",
    native_token_id: "xdai",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/xdai/8b5320523b30bd57a388d1bcc775acd5.png",
    wrapped_token: {
      name: "Wrapped XDAI",
      decimals: 18,
      symbol: "WXDAI",
      address: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
    },
  },
  matic: {
    id: "matic",
    community_id: 137,
    name: "Polygon",
    native_token_id: "matic",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/matic/d3d807aff1a13e9ba51a14ff153d6807.png",
    wrapped_token: {
      name: "Wrapped Matic",
      decimals: 18,
      symbol: "WMATIC",
      address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    },
  },
  polygon: {
    id: "matic",
    community_id: 137,
    name: "Polygon",
    native_token_id: "matic",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/matic/d3d807aff1a13e9ba51a14ff153d6807.png",
    wrapped_token: {
      name: "Wrapped Matic",
      decimals: 18,
      symbol: "WMATIC",
      address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    },
  },
  fantom: {
    id: "ftm",
    community_id: 250,
    name: "Fantom",
    native_token_id: "ftm",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/ftm/700fca32e0ee6811686d72b99cc67713.png",
    wrapped_token: {
      name: "Wrapped Fantom",
      decimals: 18,
      symbol: "WFTM",
      address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    },
  },
  ftm: {
    id: "ftm",
    community_id: 250,
    name: "Fantom",
    native_token_id: "ftm",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/ftm/700fca32e0ee6811686d72b99cc67713.png",
    wrapped_token: {
      name: "Wrapped Fantom",
      decimals: 18,
      symbol: "WFTM",
      address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    },
  },
  okt: {
    id: "okt",
    community_id: 66,
    name: "OEC",
    native_token_id: "okt",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/okt/1228cd92320b3d33769bd08eecfb5391.png",
    wrapped_token: {
      name: "Wrapped OKT",
      decimals: 18,
      symbol: "WOKT",
      address: "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15",
    },
  },
  heco: {
    id: "heco",
    community_id: 128,
    name: "HECO",
    native_token_id: "heco",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/heco/db5152613c669e0cc8624d466d6c94ea.png",
    wrapped_token: {
      name: "Wrapped HT",
      decimals: 18,
      symbol: "WHT",
      address: "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
    },
  },
  avalanche: {
    id: "avax",
    community_id: 43114,
    name: "Avalanche",
    native_token_id: "avax",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/avax/4d1649e8a0c7dec9de3491b81807d402.png",
    wrapped_token: {
      name: "Wrapped AVAX",
      decimals: 18,
      symbol: "WAVAX",
      address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    },
  },
  avax: {
    id: "avax",
    community_id: 43114,
    name: "Avalanche",
    native_token_id: "avax",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/avax/4d1649e8a0c7dec9de3491b81807d402.png",
    wrapped_token: {
      name: "Wrapped AVAX",
      decimals: 18,
      symbol: "WAVAX",
      address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    },
  },
  op: {
    id: "op",
    community_id: 10,
    name: "Optimism",
    native_token_id: "op",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/op/01ae734fe781c9c2ae6a4cc7e9244056.png",
    wrapped_token: {
      name: "Wrapped Ether",
      decimals: 18,
      symbol: "WETH",
      address: "0x4200000000000000000000000000000000000006",
    },
  },
  arb: {
    id: "arb",
    community_id: 42161,
    name: "Arbitrum",
    native_token_id: "arb",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/arb/f6d1b236259654d531a1459b2bccaf64.png",
    wrapped_token: {
      name: "Wrapped Ether",
      decimals: 18,
      symbol: "WETH",
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    },
  },
  celo: {
    id: "celo",
    community_id: 42220,
    name: "Celo",
    native_token_id: "0x471ece3750da237f93b8e339c536989b8978a438",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/celo/41da5c1d3c0945ae822a1f85f02c76cf.png",
    wrapped_token: { name: "", decimals: 18, symbol: "", address: "" },
  },
  movr: {
    id: "movr",
    community_id: 1285,
    name: "Moonriver",
    native_token_id: "movr",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/movr/4b0de5a711b437f187c0d0f15cc0398b.png",
    wrapped_token: {
      name: "Wrapped MOVR",
      decimals: 18,
      symbol: "WMOVR",
      address: "0xe3c7487eb01c74b73b7184d198c7fbf46b34e5af",
    },
  },
  cro: {
    id: "cro",
    community_id: 25,
    name: "Cronos",
    native_token_id: "cro",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/cro/44f784a1f4c0ea7d26d00acabfdf0028.png",
    wrapped_token: {
      name: "Wrapped CRO",
      decimals: 18,
      symbol: "WCRO",
      address: "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
    },
  },
  boba: {
    id: "boba",
    community_id: 288,
    name: "Boba",
    native_token_id: "boba",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/boba/e43d79cd8088ceb3ea3e4a240a75728f.png",
    wrapped_token: {
      name: "Wrapped ETHER",
      decimals: 18,
      symbol: "WETH",
      address: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000",
    },
  },
  metis: {
    id: "metis",
    community_id: 1088,
    name: "Metis",
    native_token_id: "metis",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/metis/b289da32db4d860ebf6fb46a6e41dcfc.png",
    wrapped_token: {
      name: "Wrapped METIS",
      decimals: 18,
      symbol: "WMETIS",
      address: "0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481",
    },
  },
  btt: {
    id: "btt",
    community_id: 199,
    name: "BitTorrent",
    native_token_id: "btt",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/btt/2130a8d57ff2a0f3d50a4ec9432897c6.png",
    wrapped_token: {
      name: "Wrapped BTT",
      decimals: 18,
      symbol: "WBTT",
      address: "0x197a4ed2b1bb607e47a144b9731d7d34f86e9686",
    },
  },
  aurora: {
    id: "aurora",
    community_id: 1313161554,
    name: "Aurora",
    native_token_id: "aurora",
    logo_url:
      "https://static.debank.com/image/chain/logo_url/aurora/c7590fd2defb8e7d7dc071166838c33a.png",
    wrapped_token: { name: "Aurora", decimals: 18, symbol: "WHT", address: "" },
  },
};

const COMPOUNDING_TOKENS = {
  "0x580de58c1bd593a43dadcf0a739d504621817c05": true,
};

const transfer_topic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const per_cycle = 100000;

const debank_baseurl = "https://openapi.debank.com/v1/";

const fs = require("fs");
const debank_protocol_file = fs.readFileSync(
  "./data/debank/protocol_list.json"
);
const debank_protocol_ref = JSON.parse(debank_protocol_file).data;
const debank_wrapped_tokens = require("./data/debank/wrappedTokens.json");

const debank_reward_tokens = require("./data/debank/rewards.json");

const CovalentPrices = {
  eth: require("./data/covalent/eth.json"),
  bsc: require("./data/covalent/bsc.json"),
  ftm: require("./data/covalent/ftm.json"),
  matic: require("./data/covalent/matic.json"),
  avax: require("./data/covalent/avax.json"),
};

module.exports = {
  chainCoins,
  apiKeys,
  debank_chain_details,
  debank_protocol_ref,
  debank_wrapped_tokens,
  debank_reward_tokens,
  COMPOUNDING_TOKENS,
  CovalentPrices,
  // transfer_topic,
  // per_cycle,
  // debank_baseurl
};

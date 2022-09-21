# DefiReturn

DefiReturn is a decentralized finance (DeFi) dashboard that shows unrealized profit and loss, which is the difference between what you paid for an investment in the past (cost) and what the investment is worth today (value). As far as we know, this functionality is unique: no other dashboard provides it. DefiReturn currently supports five blockchains: Ethereum, Binance Smart Chain, Polygon, Fantom and Avalanche. DefiReturn is free to use but not currently open-source.

This readme is for developers that want to contribute to the project. It describes the architecture, code and explains how to install DefiReturn on your local machine so you can contribute to it.

## Architecture

DefiReturn is organized into three sections:

1. **Front End**: The user interface. [defireturn_ui repo](https://github.com/jswift24/defireturn_ui)<BR>
   When a user plugs in a wallet address into the main form, our UI issues a request to the back end which kicks off a cost basis calculation job. This job can take 1-5 minutes, depending on how complex the wallet is. The UI polls the backend server every 1-2 seconds to get a status update on the job. This is rendered as a progress bar. When the job is complete, the back end sends the full response, which includes cost, value and history for every wallet position. The UI renders this, and the user can explore it.
2. **Back End**: The cost basis server. [This repo (cost_basis_ab)](https://github.com/jswift24/cost_basis_ab)<BR>
   The back end processes cost basis jobs initiated by the UI. The input is a wallet address. The output is JSON which contains cost, value and history for the wallet. The back end is coded in Node.js. Because a cost basis job can take 1-5 minutes to complete, we do not make the client keep an open connection to wait for a response. Instead, the job runs in Redis on the back-end server, while the UI polls it. We use MongoDB to cache native coin prices for each chain, and we use these to quickly calculate gas fees.
3. **Analytics**: Offline blockchain analysis. [debank_protofols repo](https://github.com/jswift24/debank_protocols)<BR>
   Set of utilities to used offline to analyze blockchain data and configure support for various DeFi protocols. We use this code to create a mapping that links Defi protocols to their smart contract addresses, the coins they accept as deposits, and the underlying tokens used to value their positions. This data is stored in `data/vfat_all.json`. This data is used to link a defi position to its history.

## Code Overview

Most of the business logic in the back end is in the file [services/wallet.js](https://github.com/jswift24/cost_basis_ab/blob/dev/services/wallet.js). Think of the workflow in three sections:

1. **Download blockchain data**<BR>
   Business logic begins with `getWalletsCostHistory()`. The input to this function is the wallet address to be analyzed. The output is a JSON response ready to go to the UI. This function begins by fetching blockchain data from two sources: Moralis and DeBank. We need both because...
   - Moralis: We have a paid account with Moralis. It provides for high throughput and historical prices accurate to the block.
   - DeBank: Debank offers high-quality data for many DeFi protocols, and its API is free, but it covers only current values, not historical, and its throughput is limited.

We fetch the following data from the blockchain:<BR>

- `global_token_info_debank`: Token balances from Debank. Includes token metadata, such as the ticker symbol and number of decimals.
- `global_complex_protocol_debank`: Defi protocol data from [this Debank API](https://docs.open.debank.com/en/reference/api-pro-reference/user#get-user-complex-protocol-list-on-all-supported-chains). Includes current value.
- `global_balances`: Token balances from Moralis. Used as a fallback if we don't have the metadata we need from DeBank
- `global_transfers`: ERC20 transfers from Moralis. One transaction can consist of multiple ERC20 transfers. Includes the coin being transfered, from_address, to_address and the units.
- `global_tx`: Transction data from Moralis. We use this to calculate gas costs.

After downloading blockchain data, we `getWalletCostBasis()` for each chain. It does the following:

2. **Prepare the wallet**<BR>
   Raw blockchain data isn't conducive to calculating the cost basis. We need to match buy and sell transactions together. In this section, we prepare the raw data to be matched. Preparation happens in two main areas:
   - We augment `global_transfers` to add certain transfers required to link buys and sells. For example, we add native token transfers (such as `eth` on Ethereum) as and artificial receipts for Defi protocols that do not issue receipt tokens, such as most farms or curve gauges. More details on this in the section "Preparing Transfers" below.
   - We collate defi positions from `global_complex_protocol_debank` and tokens from `global_token_info_debank` into a single common portfolio called `wallet_positions`. The function that does this is `prepWallet()`.
3. **Process the wallet**<BR>
   In this section, we loop through `wallet_positions` and call a recursive algorithm implemented in `getTokenCostBasis()` to get the history and cost basis of an individual defi position. In the future, we will also get the cost basis of liquid tokens here. The protocol looks through illiquid tokens until it can find liquid tokens in the history, then aggregates those to come up with a total cost. The details are [here](https://docs.google.com/document/d/1Lrb0UKjMRERlMDTne1uhDwFm5yer77LdVJd9IrM1BZc/edit).<P>
   One of the most important parts of the cost basis algorithm is historical pricing. We get price data from Moralis and Covalent.
   - Moralis provides historical prices from DEXes such as Sushiswap, Quickswap and Uniswap. Moralis uses archive nodes to provide prices that are accurate to the block.
   - Covalent uses CoinGecko data which is at daily granularity.
4. **Prepare the response**
   `makeTokenResult()` converts the data from `getTokenCostBasis()` into a data structure ready to show the user. It calculates the underlying assets for each defi position, total cost and value. Profit % is calculated by the UI client.

## Preparing Transfers

When you calculate the cost basis of a stock, you look at all the buys and sells of that stock and net them out. Our goal is to do the same for web3 investments. Here is how we calculate cost basis for a few cases, arranged from simple to complex.

1. **Wallet Token, Liquid**<BR>
   We do not yet handle this case. We will in the future.

2. **Wallet Token, Illiquid**<BR>
   How to get history: We look at all ERC20 transfers for that token. A "Buy" is a transfer into the wallet. A "Sell" is a transfer out of the wallet.<BR><BR>
   How to calculate cost basis: - To calculate the dollar amount of the "Buy", we look at the coins on the other side of the transaction, eg. if I buy 100 units of Token A for 200 units token B, and the price of token B is $2, then the cost basis of that transaction is 200 \* $2 = $400. The cost basis of token A will increase by $400 as a result of this transaction. - If token B is illiquid, we start the process over again, recursively, and look at buys and sells of token B.

3. **Defi position with a receipt / LP token, such as Liquidity Farming with Uniswap**<BR>
   How to get history: Same as in case 2. We have a receipt token (such as an LP token), so we can treat it like any other illiquid token.

4. **Defi position without a receipt / LP token, such as Farming with Sushiswap**<BR>
   Why the previous case will not work: Some defi protocols do not issue a receipt token. You deposit token A into a vault, and the vault does not give you anything back. All balances are kept in the vault's smart contract. So, if we start with the vault address, we will not be able to detect any buys and sells to it.<BR><BR>
   How to get history: When you deposit token A into a vault, we create a synthetic "vault receipt" which is an extra ERC20 transfer that comes back from the vault to the wallet. This transfer is not on the blockchain, it only exists on DefiReturn.app to help with accounting. It allows us to tie the vault address to its history.

5. **Defi Borrowing, like on AAVE**<BR>
   Why the previous case will not work: All of the prior cases follow the "token exchange" pattern: You send token A, you get back token B. But when you borrow tokens from a lending protocol, such as AAVE, you get token A, which is the token you borrowed (like USDC) and you also get token B (like AAVE_debt_USDC), which is a debt-token in your wallet that marks a liability. It's there to note that you owe money to AAVE. So, you got two tokens and sent none out. This breaks the pattern we can handle above.<BR><BR>
   How to get history: Normally, when a token comes into the wallet, it increases the cost basis. However, when that token is a debt tokens (we have a list), it counts as a liability. So in the AAVE example above, if you get USDC and AAVE_debt_USDC in the same transaction, the value of AAVE_debt_USDC will be -1 \* the value of the USDC you received.

## Getting Started / Installation

The best way to get started with DefiReturn is to create a local development environment. Download each of the repos and install them. Below are instructions for installing this (backend) repo. The ui repo has its own installation instructions.

1. Install packages

```shell
yarn
```

2. Install redis

If running on windows, install latest binary from here: https://github.com/microsoftarchive/redis/releases

3. Start server

```shell
yarn start
```

**Swagger url:** `http://localhost:${PORT}/api`

After launch, the console will contain the address where the local server is deployed

## Folder structure

- `controllers` - surface logic of API request processing

- `helpers` - a set of auxiliary functions, in our case these are functions for working with **moralis** and **debank**

- `services` - The main processes that occur on the server in our case is an algorithm for finding the **cost basis**

- `jobs` -working with the **bull.js** is placed in a separate folder

- `proccesors` - it is possible for the future to configure **bull.js** for individual processors

- `routers/api` - classes for routing API requests

- `utils` - auxiliary functions, usually utils can be reused in different projects, since this is a common case of implementations
- `migration` - utils of database migration
- `cloud` - Moralis Cloud functions

## MongoDB cache

The cloud job in the moralis server runs frequently to update the moralis prices on MongoDB. In cloud function, we can't use mongoose node module so, we can interact with MongoDB using defireturn server REST API. So before uploading cloud job function code to moralis server, we should confirm the value of serverURL variable.
After that, we can use this moralis CLI to upload code to moralis server and then schedule the job running on moralis server dashboard.

## Contributing

I want to describe the development process.

We have basic `main` and `dev` branches. We will build our development process using the gitflow approach.

A separate branch is created for each issue or group of issues. After the work is completed, the branch must be merged into `dev` or make a pull request.

Once `dev` has stable and tested code, we can merge into `main`.

> **NOTE!** Don't forget to get the latest code from dev before creating a new branch.

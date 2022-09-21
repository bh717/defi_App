//const { default: Moralis } = require("moralis/types")

//Heroku URL
//const serverURL = 'https://defireturn-backend-dev.herokuapp.com';//dev Mode
const serverURL = 'https://defireturn-backend.herokuapp.com';//prod Mode
//const serverURL = 'https://2853-2-57-169-24.ngrok.io';//local Mode

Moralis.settings.setAPIRateLimit({
    anonymous: 3550, authenticated: 3550, windowMs: 60000
})

Moralis.Cloud.job("UpdatePricesJob", async (request) => {
    let fakelimit = 3;
    const chainCoins = {
        polygon: {
            chainId: "matic",
            address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            priceStep: 300
        },
        eth: {
            chainId: "eth",
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            priceStep: 100
        },
        bsc: {
            chainId: "bsc",
            address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
            priceStep: 300
        },
        fantom: {
            chainId: "ftm",
            address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
            priceStep: 1000
        },
        avalanche: {
            chainId: "avax",
            address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            priceStep: 300
        },
    };
    const logger = Moralis.Cloud.getLogger();
    const latestResult = await Moralis.Cloud.httpRequest({
        method: 'POST',
        url: `${serverURL}/mongoPrices/getLatest`
    }).then(function (httpResponse) {
        return { success: true, data: httpResponse.data };
    }, function (httpResponse) {
        return { success: false, error: httpResponse };
    }).catch((err) => {
        return { success: false, error: err };
    });
    if (!latestResult || latestResult.success == false) {
        logger.info("UpdatePrices Job Error");
        logger.info(error);
        return;
    }
    logger.info("Get Latest Success");
    logger.info(latestResult);
    const latestBlockHeights = latestResult.data.latestBlockHeight;
    let flagArr = {
        polygon: false,
        eth: false,
        bsc: false,
        fantom: false,
        avalanche: false
    }
    try {
        //while(fakelimit--) {
        while(true) {
            let flag = false;
            for (const chain in chainCoins) {
                const chainID = chainCoins[chain].chainId;
                const calcStep = chainCoins[chain].priceStep;
                const nativeCoinAddress = chainCoins[chain].address;
                let newChainPrices = [];
                if (flagArr[chain] == true) {
                    continue;
                }
                let curBlock = latestBlockHeights[chain];
                if (curBlock == -1) {
                    continue;
                }
                flag = true;
                curBlock += calcStep;
                const options = {
                    address: nativeCoinAddress,
                    chain: chain,
                    to_block: curBlock,
                };
                logger.info(`${chain} ${curBlock} started`);
                const result = await Moralis.Web3API.token
                    .getTokenPrice(options)
                    .then((price) => {
                        return { success: true, price: price.usdPrice };
                    })
                    .catch((err) => {
                        logger.info(`Error ${curBlock}`);
                        logger.info(err);
                        return { success: false, error: err?.error };
                    });
                if (result.success == false) {
                    if (result.error?.slice(0, 8) == "No pools") {
                        flagArr[chain] = true;
                    }
                }
                else {
                    logger.info(`${result.price} ${curBlock} ${chain}`);
                    const updateResult = await Moralis.Cloud.httpRequest({
                        method: 'POST',
                        url: `${serverURL}/mongoPrices/updateDBOne`,
                        body: {
                            price: result.price,
                            block_height: curBlock,
                            chain: chain
                        }
                    }).then(function (httpResponse) {
                        return { success: true, data: httpResponse.data };
                    }, function (httpResponse) {
                        return { success: false, error: httpResponse };
                    });
                    if (updateResult.success == false) {
                        logger.error("UpdatePrices Job Error", updateResult.error);
                    } else {
                        logger.info("UpdatePrices Job finished Successfully");
                        latestBlockHeights[chain] = curBlock;
                    }
                    //newChainPrices.push({price: result.price, block_height: curBlock});
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (flag == false) {
                break;
            }
        }
    } catch (error) {
        logger.info("UpdatePrices Job Error", error);
        return;
    }
});

const LatestPriceNumber = require("../models/latestPrice");
const PriceModelList = {
    eth: require("../models/ethPrice"),
    polygon: require("../models/maticPrice"),
    bsc: require("../models/bscPrice"),
    fantom: require("../models/ftmPrice"),
    avalanche: require("../models/avaxPrice"),
};
const { chainCoins } = require("../constant");

const { latestBlockHeight } = require("../helpers/moralis");

const getLatestPriceNumber = async (req, res) => {
    res.json({ latestBlockHeight });
}

const addLatestPriceNumbers = async (req, res) => {

    try {
        const latestPrices = JSON.parse(req.body.latestPrices);
        //console.log(latestPrices);
        for (const chain in chainCoins) {
            const chainID = chainCoins[chain].chainId;
            const PriceModel = PriceModelList[chain];
            const prices = latestPrices[chain];

            while (true) {
                try {
                    await PriceModel.insertMany(prices);
                    break;
                } catch (err) { }
            }

            const chainPrice = await LatestPriceNumber.findOne({ chain: chainID });
            const curBlock = prices[prices.length - 1].block_height;
            while (true) {
                try {
                    await chainPrice.updateOne({ block_height: curBlock });
                    break;
                } catch (err) { }
            }
            latestBlockHeight[chain] = curBlock;
        }
        console.log("Update finished");
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500);
    }
}


const addPrice = async (req, res) => {

    try {
        const { price, chain, block_height } = req.body
        //console.log(chain, block_height, price, "Trying");
        //console.log(latestPrices);
        const PriceModel = PriceModelList[chain];
        //const prices = latestPrices[chain];
        const chainID = chainCoins[chain].chainId;
        const chainPrice = await LatestPriceNumber.findOne({ chain: chainID });
        const newPrice = new PriceModel({
            price: price,
            block_height: block_height
        })
        while (true) {
            try {
                await newPrice.save();
                break;
            } catch (err) { }
        }

        while (true) {
            try {
                await chainPrice.updateOne({ block_height: block_height });
                break;
            } catch (err) { }
        }
        latestBlockHeight[chain] = block_height;
        console.log(`Add chain-${chain} block-${block_height} price-${price} Success`);
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500);
    }
}
module.exports = {
    getLatestPriceNumber,
    addLatestPriceNumbers,
    addPrice
};
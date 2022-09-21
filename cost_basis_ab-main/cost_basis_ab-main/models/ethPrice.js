const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const EthPriceListSchema = new Schema({
    block_height: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    date : {
        type: Date,
        default: Date.now()
    }
});

module.exports = EthPriceList = mongoose.model("moralisEthPrice", EthPriceListSchema);

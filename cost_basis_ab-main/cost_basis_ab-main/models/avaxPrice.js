const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const AvaxPriceListSchema = new Schema({
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

module.exports = AvaxPriceList = mongoose.model("moralisAvaxPrice", AvaxPriceListSchema);

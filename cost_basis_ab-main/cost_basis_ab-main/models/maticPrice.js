const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MaticPriceListSchema = new Schema({
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

module.exports = MaticPriceList = mongoose.model("moralisMaticPrice", MaticPriceListSchema);

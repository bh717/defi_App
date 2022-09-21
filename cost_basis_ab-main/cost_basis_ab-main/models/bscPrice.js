const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const BscPriceListSchema = new Schema({
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

module.exports = BscPriceList = mongoose.model("moralisBscPrice", BscPriceListSchema);

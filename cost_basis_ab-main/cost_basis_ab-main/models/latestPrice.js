const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const LatestPriceNumberSchema = new Schema({
    block_height: {
        type: Number,
        required: true,
    },
    chain: {
        type: String,
        required: true
    },
    date : {
        type: Date,
        default: Date.now()
    }
});

module.exports = LatestPriceNumber = mongoose.model("latestPriceNumber", LatestPriceNumberSchema);

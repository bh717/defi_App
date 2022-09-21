const express = require("express");
const walletController = require("./../../controllers/wallet.controller");
const mongoController = require("./../../controllers/mongo.controller");

const {
  getTokenLists,
  getTokenHistory,
  getComplexProtocolLists,
} = require("../../utils/index.js");

const router = express.Router();

/**
 * @openapi
 * /wallet/{wallet-address}:
 *   post:
 *     summary: Start proccess analyzing cost basis for wallet
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: wallet-address
 *         schema:
 *           type: string
 *         required: true
 *     description: Start proccess analyzing cost basis for wallet.
 *     responses:
 *       201:
 *         description: Refund in case of successful start of the process.
 */
router.post("/wallet/:id", walletController.walletCostBasis);
/**
* @openapi
* /wallet/{wallet-address}:
*   post:
*     summary: Start proccess analyzing cost basis for wallet
*     tags: [Wallet]
*     parameters:
*       - in: path
*         name: wallet-address
*         schema:
*           type: string
*         required: true
*     description: Start proccess analyzing cost basis for wallet.
*     responses:
*       201:
*         description: Refund in case of successful start of the process.
*/
router.post("/wallet/:id/:chain", walletController.walletCostBasisForTest);
router.post("/wallet/:id/:chain/:protcol_id", walletController.walletCostBasisForTest);

/**
 * @openapi
 * /status/{wallet-address}:
 *   get:
 *     summary: Get the status for the wallet if it is currently in the process of processing
 *     description: Get the status for the wallet if it is currently in the process of processing.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: wallet-address
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The current execution progress or result is returned.
 */
router.get("/status/:id", walletController.walletStatus);

/**
 * @openapi
 * /mongoPrices/getLatest:
 *   post:
 *     summary: Get the latest prices' block heights of MongoDB
 *     description: Get the latest prices' block heights of MongoDB
 *     tags: 
 *     parameters:
 *       - in: path
 *         name: wallet-address
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The array of current latest prices' block height number.
 */
router.post("/mongoPrices/getLatest", mongoController.getLatestPriceNumber);

/**
 * @openapi
 * /mongoPrices/updateDB:
 *   post:
 *     summary: Insert and change records to MongoDB
 *     description: Insert and change records to MongoDB
 *     tags: [latestPrices]
 *     parameters:
 *       - in: 
 *         name: latestPrices
 *         schema:
 *           type: array
 *         required: true
 *     responses:
 *       200:
 *         description: Update to MongoDB finished.
 */
 router.post("/mongoPrices/updateDB", mongoController.addLatestPriceNumbers);

/**
 * @openapi
 * /mongoPrices/updateDBOne:
 *   post:
 *     summary: Insert and change records to MongoDB
 *     description: Insert and change records to MongoDB
 *     tags: [chain, price, block_height]
 *     parameters:
 *       - in: 
 *         name: chain
 *         schema:
 *           type: string
 *         required: true
 *       - in: 
 *         name: prcie
 *         schema:
 *           type: Number
 *         required: true
 *       - in: 
 *         name: block_height
 *         schema:
 *           type: Number
 *         required: true
 *     responses:
 *       200:
 *         description: Update One record to MongoDB finished.
 */
 router.post("/mongoPrices/updateDBOne", mongoController.addPrice);

module.exports = router;

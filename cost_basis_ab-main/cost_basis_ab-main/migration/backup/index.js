//const config = require("./config");
const EthPrice = require("../../models/ethPrice");
const AvaxPrice = require("../../models/avaxPrice");
const FtmPrice = require("../../models/ftmPrice");
const MaticPrice = require("../../models/maticPrice");
const BscPrice = require("../../models/bscPrice");
const LatestPriceNumber = require("../../models/latestPrice");
const fs = require('fs');
const mongoose = require("mongoose");
const chainList = ["eth", "matic", "avax", "bsc", "ftm"];
const PriceModelList = [EthPrice, MaticPrice, AvaxPrice, BscPrice, FtmPrice];


async function download(mongoURI) {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to ", mongoURI);

        const priceArr = Array(chainList.length);
        for(let i = 0; i < chainList.length; i++) {
            const PriceModel = PriceModelList[i];
            console.log(chainList[i], "Download Started")
            const results = await PriceModel.find({}).exec();
            priceArr[i] = results;
        }
        await mongoose.connection.close();
        return { success: true, priceArr };
    } catch (err) {
        return { success: false };
    }
}

async function upload(mongoURI, priceArr) {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to ", mongoURI);
        
        await LatestPriceNumber.deleteMany();
        for(let i = 0; i < chainList.length; i++) {
            const PriceModel = PriceModelList[i];
            console.log("Upload Started ", chainList[i]);
            const PriceCollections = priceArr[i].map((item) => { 
                return {
                    price: item.price,
                    block_height: item.block_height
                }
            });
            let maxHeight = -1;
            for (let j = 0; j < PriceCollections.length; j++) {
                if (PriceCollections[j].block_height > maxHeight) {
                    maxHeight = PriceCollections[j].block_height;
                }
            }
            await PriceModel.deleteMany();
            await PriceModel.insertMany(PriceCollections);
            const newLatest = LatestPriceNumber({
                block_height: maxHeight,
                chain: chainList[i]
            });
            await newLatest.save();
            console.log("Records Saved");
        }
        await mongoose.connection.close();
        return { success: true };
    } catch (err) {
        console.log(err);
        return { success: false };
    }

}

async function uploadLocalToMongoDB(mongoURI, localPath) {
    
    const priceArr = Array(chainList.length);
    for (let i = 0; i < chainList.length; i++) {            
        try {
            priceArr[i] = JSON.parse(fs.readFileSync(`${localPath}/${chainList[i]}PriceData.json`));
            //console.log(priceArr[i]);
        } catch (err) {
            console.log(`Read File Error: ${localPath}/${chainList[i]}PriceData.json`)
            priceArr[i] = [];
        }
    }
    
    const { success } = await upload(mongoURI, priceArr);
    if (success == false) {
        console.log("Upload Failed");
    } else {
        console.log(`Upload to ${mongoURI} Success`);
    }
}

async function downloadFromMongoDBToLocal(mongoURI, localPath) {

    const { success, priceArr } = await download(mongoURI);
    if (success == false) {
        console.log("Download Failed");
    } else {
        try {
            for (let i = 0; i < chainList.length; i++) {            
                fs.writeFileSync(`${localPath}/${chainList[i]}PriceData.json`, JSON.stringify(priceArr[i]));
            }
            console.log(`Download from ${mongoURI} Success`);
        } catch (err) {
            console.log("Download Failed");
            console.log(err);
        }
    }
}

async function switchDatabase(fromMongoURI, toMongoURI) {
    const downResult =  await download(fromMongoURI);
    if (downResult.success) {
        const uploadResult = await upload(toMongoURI, downResult.priceArr);
        if (uploadResult.success) {
            console.log("Switch Database Successfully");
            return;
        }
    }
    console.log("Switch Database Failed");
}

function displayHelp() {
    console.log("Command Line Error");
}

(async () => {
    try {
        const mode = process.argv[2];
        switch (mode) {
            case 'upload': {
                const uploadMongoURI = process.argv[3];
                let localPath = process.argv[4];
                if (localPath == undefined) {
                    localPath = './data';
                }
                await uploadLocalToMongoDB(uploadMongoURI, localPath);
                break;
            }
            case 'download': {
                const downloadMongoURI = process.argv[3];
                let localPath = process.argv[4];
                if (localPath == undefined) {
                    localPath = './data';
                }
                await downloadFromMongoDBToLocal(downloadMongoURI, localPath);
                break;
            }
            case 'switch': {
                const downloadMongoURI = process.argv[3];
                const uploadMongoURI = process.argv[4];
                await switchDatabase(downloadMongoURI, uploadMongoURI);
                break;
            }
            default:
                displayHelp();
        }
    } catch (err) {
        console.log(err);
    }
})();
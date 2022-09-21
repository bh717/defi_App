const { apiKeys } = require("../constant");
const fs = require("fs");

let GLOBAL_API_KEY_INDEX = 0;

function sortBlockNumber_reverseChrono(a, b) {
  if (a.block_number > b.block_number) {
    return -1;
  }
  if (a.block_number < b.block_number) {
    return 1;
  }
  return 0;
}

function sortBlockNumber_Chrono(a, b) {
  if (a.block_number == b.block_number) return 0;
  return a.block_number < b.block_number ? -1 : 1;
}

function convertDateTime(time) {
  return time.split(".")[0];
}

function getApiKey() {
  // await sleep(DELAY);
  const result = apiKeys[GLOBAL_API_KEY_INDEX % apiKeys.length];
  GLOBAL_API_KEY_INDEX++;
  //console.log("api key: ", GLOBAL_API_KEY_INDEX % apiKeys.length, result);
  return result;
}

function createDirIfNoExist(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function writeToFile(path, data) {
  fs.writeFileSync(`${path}`, JSON.stringify(data));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

module.exports = {
  convertDateTime,
  createDirIfNoExist,
  writeToFile,
  sleep,
  isEmpty,
  sortBlockNumber_reverseChrono,
  sortBlockNumber_Chrono,
};

const ENVIRONMENT = process.env?.ENVIRONMENT || "dev";

const CONFIG = require(`./config/config.${ENVIRONMENT}.json`);

module.exports = { CONFIG, ENVIRONMENT };

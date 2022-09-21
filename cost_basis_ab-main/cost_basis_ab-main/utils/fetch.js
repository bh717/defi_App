const axios = require("axios");

function fetch({method, url, headers, data}) {
  return axios({
    method: (method || '').toLowerCase(),
    url: url,
    headers: headers,
    data,
  })
}

module.exports = async function sendRequest({url, apiKey}) {
  try {
    const result = await fetch({url, headers: {'content-type': 'application/json', 'x-api-key': apiKey}, method: 'get'});
    return result.data;
  } catch (err) {
    console.log(`axios error at ${apiKey}: `, err.message, 'url: ', url);
    // async function retry() {
    //   setTimeout(() => {
    //     sendRequest({url, apiKey});
    //   }, 300);
    // }
    // await retry();
    return null;
  }
}
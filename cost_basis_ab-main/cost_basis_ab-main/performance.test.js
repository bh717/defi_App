const axios = require("axios");

const { chainCoins } = require("./utils/constant");

const N = 1;

async function tt(url) {
  const f = async () => {
    const r = [];
    for (const chain in chainCoins) {
      const response = await axios.post(url);
      r.push(response.data.length);
    }
    return r;
  };

  const arr = [];
  for (let i = 0; i < N; i++) {
    arr.push(f());
  }

  const res = await Promise.all(arr);

  res.forEach((item) => console.log(item));
}

describe("Performance", () => {
  describe("nelify", () => {
    test("call request", async () => {
      console.log("==================================================");
      await tt(
        `https://defireturn.herokuapp.com/wallet/0xf8aae8d5dd1d7697a4ec6f561737e68a2ab8539e`
      );
    }, 1200000);
  });

  describe("server", () => {
    test("call request", async () => {
      console.log("==================================================");
      await tt(
        "http://45.82.85.36/api/wallet/0xf8aae8d5dd1d7697a4ec6f561737e68a2ab8539e"
      );
    }, 1200000);
  });
});

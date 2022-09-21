const Moralis = require("moralis/node");
const work = require("./../jobs/work");
const { STATE: MORALIS_STATE } = require("./../helpers/moralis");

const workQueue = work.workQueue;

const serverUrl = " https://y5ia4cmzyxvr.usemoralis.com:2053/server";
const appId = "6fV66zsd6vkFhBP3AwLh7X2A3ANGL3B9OGbn5G8Y";

Moralis.initialize(appId);
Moralis.serverUrl = serverUrl;

const walletCostBasis = async (req, res) => {
  if (!MORALIS_STATE.started) return res.status(400).end();

  const wallet = req.params.id.toLowerCase();
  const cache = work.getHistory(wallet);

  let isExpire = false;
  if (cache) {
    if (Date.now() - cache.time < 120000) {
      return res.status(201).end();
    } else {
      isExpire = true;
    }
  }

  let job = await workQueue.getJob(wallet);

  if (job) {
    const state = await job.getState();

    console.log({ state });

    switch (state) {
      case "completed":
        if (!cache || isExpire) {
          await job.remove();
          break;
        }
      case "stuck":
      case "delayed":
      case "failed":
        await job.remove();
        break;
    }
  }

  // work.deleteHistory(wallet);

  await workQueue.add({
    jobWallet: wallet
  }, {
    jobId: wallet,
    timeout: 60000000,
    removeOnFail: true,
    removeOnComplete: true,
  });

  res.status(201).end();
};

const walletCostBasisForTest = async (req, res) => {
  if (!MORALIS_STATE.started) return res.status(400).end();

  const wallet = req.params.id.toLowerCase();
  const jobChain = req.params.chain;
  const jobProtocol = req.params.protcol_id;
  const cache = work.getHistory(wallet);

  
  let isExpire = false;
  if (cache) {
    if (Date.now() - cache.time < 120000) {
      return res.status(201).end();
    } else {
      isExpire = true;
    }
  }

  let job = await workQueue.getJob(wallet);

  if (job) {
    const state = await job.getState();

    console.log({ state });

    switch (state) {
      case "completed":
        if (!cache || isExpire) {
          await job.remove();
          break;
        }
      case "stuck":
      case "delayed":
      case "failed":
        await job.remove();
        break;
    }
  }

  // work.deleteHistory(wallet);

  await workQueue.add({
    jobChain,
    jobProtocol,
    jobWallet: wallet
  }, {
    jobId: `${wallet}_${jobChain}${jobProtocol ? "_" + jobProtocol : ""}`,
    timeout: 60000000,
    removeOnFail: true,
    removeOnComplete: true,
  });

  res.status(201).end();
}

const walletStatus = async (req, res) => {
  const wallet = req.params.id.toLowerCase();
  const job = await workQueue.getJob(wallet);

  const cache = work.getHistory(wallet);

  if (cache) {
    cache.result = cache.result ?? [];
    console.log(cache.time, cache.result?.result?.length);
    if (Date.now() - cache.time < 140000) {
      return res.json({
        result: cache.result.result,
        time: cache.time,
        footnotes: cache.result.footnotes,
      });
    }
  }

  if (!job) {
    return res.json({
      result: [],
    });
  }

  const state = await job.getState();
  if (!(state == "active" || state == "completed")) {
    return res.json({
      result: [],
    });
  }

  const status = await job.progress();

  if (!status) {
    return res.json({
      progress: 0,
    });
  }

  let partMain = status.part[0];
  let progress = 0;

  const tmps = [];

  let cnt = 0;

  for (const i in status.part) {
    const part = status.part[i];
    cnt += part.current;

    if (part.current > 0 && part.current != part.total) {
      tmps.push(part);
    }
  }

  if (tmps.length > 0) {
    const index = Math.floor(Math.random() * tmps.length);
    partMain = tmps[index];
  }
  if (status.total > 0) {
    progress = (cnt / status.total) * 100;
  }

  const result = {
    progress: progress | 0,
    chain: partMain.chain,
    current: partMain.current,
    total: partMain.total,
    state,
  };

  res.json(result);
};

module.exports = {
  walletCostBasis,
  walletStatus,
  walletCostBasisForTest
};

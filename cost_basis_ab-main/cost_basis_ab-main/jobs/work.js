const Queue = require("bull");
const services = require("../services/wallet");
const Moralis = require("moralis/node");
const Sentry = require("@sentry/node");
const Utils = require("./../utils");

const REDIS_URL = process.env?.REDIS_URL || "redis://127.0.0.1:6379";
const ObjUser = Moralis.Object.extend("History");
const _history = {};

const workQueue = new Queue("work", REDIS_URL);

workQueue.process(100, (job) => {
  console.log("job.id", job.id);

  return workAsync(job);
});

workQueue.on("completed", (job, result) => {
  const d = new Date();
  const data = d
    .toISOString()
    .replaceAll(":", "")
    .replaceAll("-", "")
    .replaceAll("T", "");

  const path = `${__dirname}/../history/${job.id}-${data}.json`;

  try {
    Utils.writeToFile(path, result);
  } catch (err) {
    console.log(err);
  }
});

workQueue.on("failed", async (job, error) => {
  const obj = {
    msg: error.message,
    wallet: job.id,
    start: job.processedOn ? new Date(job.processedOn).toISOString() : "",
    end: job.finishedOn ? new Date(job.finishedOn).toISOString() : "",
    progress: JSON.stringify(job.progress()),
  };

  await job.remove();

  Sentry.captureException(obj);
});

async function workAsync(job) {
  const wallet = job.data.jobWallet;

  const user = new ObjUser();
  user.set("wallet", wallet);
  const start = new Date();
  user.set("start", start.toISOString());
  await user.save(null, { useMasterKey: true });

  const result = await services.getWalletsCostHistory(
    {
      ...job.data,
      wallet,
    },
    job
  );

  const end = new Date();
  _history[job.id] = { time: end.getTime(), result };

  user.set("end", end.toISOString());
  await user.save(null, { useMasterKey: true });

  console.log(
    `Finished job ${job.id}: `,
    (end.getTime() - start.getTime()) / 1000,
    "sec"
  );
  return Promise.resolve(result);
}

function getHistory(id) {
  return _history[id];
}

function deleteHistory(id) {
  delete _history[id];
}

function clear() {
  //workQueue.
}

module.exports = {
  workQueue,
  getHistory,
  deleteHistory,
};

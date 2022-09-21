const services = require("./../services");

module.exports = async (job, done) => {
  console.log("job.id", job.id);

  // const results = await Moralis.Cloud.run("watchJobAddress", {
  //   address: job.id,
  // });

  const wallet = job.id;
  const result = await services.getWalletsCostHistory(
    {
      wallet,
    },
    job
  );

  console.log("OK");
  done(null, result);
  job.progress(100);
};

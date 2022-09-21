// (async () => {
//     const  Moralis = require('moralis/node')
//     console.log(Moralis.CoreManager.get("VERSION"))
//     await Moralis.start({ serverUrl: "https://c4og8ukjjptz.usemoralis.com:2053/server", appId: "DIYKGp7Vjz4TZhjENRvBJ8hFzznQ6XQ30WVYEiuN", masterKey: "ZpvDkPGR192hu4Oyy8pVBYPb6Lnk6YWLfUK6wLci" });

//     console.log("Moralis server started")
//     const results = await Moralis.Cloud.run("unwatchEthAddress", {address: "0x47cc445c8845f7186a1eab87ae5d60cda69b630c", syncHistorical: true}, {useMasterKey: true})
//     console.log(results)
// })();
const fs = require('fs');
(async () => {
    console.log(new Date().toUTCString());
    
    const  Moralis = require('moralis/node')
    console.log(Moralis.CoreManager.get("VERSION"))
    await Moralis.start({ 
        serverUrl: "https://uq2dmoq6vfug.usemoralis.com:2053/server", 
        appId: "VxdGAEVMZaP0lwehj2Jh7P4qilD7wBXwlMr5nNlW", 
        masterKey: "XmUWx0KvWMZ3pA8655fy3QhhmhMArhh9aDxKLLyF" 
    });
    
    console.log("Moralis server started")
    console.log(new Date());
    
    const results = await Moralis.Cloud.run("UpdatePricesJob")
    console.log(results);
    //fs.writeFileSync(`ffff.json`, JSON.stringify(results.retPrices));
    console.log(new Date());
})();


/*const delayTime = Number(1000 + 4000 * Math.random()).toFixed(0);
console.log(delayTime);*/
import { useState, useEffect } from "react";

export default function FootNote(props) {
  const { footnotes } = props;
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const chainCoins = [
    {
      chain: "polygon",
      name_network: "Polygon",
    }, {
      chain: "eth",
      name_network: "Ethereum",
    }, {
      chain: "bsc",
      name_network: "Binance Smart Chain",
    }, {
      chain: "fantom",
      name_network: "Fantom",
    }, {
      chain: "avalanche",
      name_network: "Avalanche",
    },
  ];
  const [footnoteData, setFootnoteData] = useState([]);

  useEffect(() => {
    let dataArray = [];
    footnotes.map(item => {
      const lastYear = new Date(item.lastTxDate).getFullYear();
      const lastMonth = new Date(item.lastTxDate).getMonth();
      const lastDate = new Date(item.lastTxDate).getDate();
      const lastTxDate = months[lastMonth] + " " + lastDate + "th " + lastYear;
      if (item.totalTx > 2000) {
        dataArray.push({ chain: item.chain, tx_count: item.totalTx, transfer_tx_count: item.pageTx, tx_date: lastTxDate });
      }
      return "";
    });

    setFootnoteData(dataArray);
  }, [footnotes]);

  const FullNetworkName = (chain) => {
    const networkName = chainCoins.find(chainCoin => { return chainCoin.chain === chain })?.name_network;
    return networkName;
  }

  const commaNumber = (num) => {
    return (num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  }

  return (
    <>
      {footnoteData.length > 0 ?
        <>
          <p style={{ color: "#fff", textAlign: "left" }}>Footnotes</p>
          {footnoteData.map((singleTx, index) => {
            return <p key={index} style={{ color: "#fff", textAlign: "left" }}>{index + 1}. This wallet has {commaNumber(singleTx.tx_count)} transactions on {FullNetworkName(singleTx.chain)}. DefiReturn analyzed the latest {commaNumber(singleTx.transfer_tx_count)} transactions. {commaNumber(singleTx.tx_count - singleTx.transfer_tx_count)} transactions prior to {singleTx.tx_date} were excluded.</p>
          })}
        </>
        :
        null
      }
    </>
  );
}

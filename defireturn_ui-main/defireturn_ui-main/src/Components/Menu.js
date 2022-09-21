import { useState, useEffect, useCallback } from "react";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { connect, useSelector, useDispatch } from "react-redux";
// import ProgressBar from "@ramonak/react-progress-bar";
import { ProgressBarLine } from "./../libs/progressbar";
import { Link, useLocation } from "react-router-dom";
import { SELECT_MENU, PORTFOLIO_DATA, FOOTNOTES_DATA } from "../actionTypes";
import CONFIG from "./../config.dev.json";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import runtimeEnv from "@mars/heroku-js-runtime-env";

const env = runtimeEnv();
const SERVE_URL = env?.REACT_APP_SERVE_URL || CONFIG.server;

let interval;

const Menu = ({ openMenu, updateMenu, allowedMenu }) => {
  const [progressVal, setProgressVal] = useState(0);
  const [chainVal, setChainVal] = useState("");
  const [currentVal, setCurrentVal] = useState(0);
  //const [allertShow, setAllertShow] = useState(false);
  const [totalVal, setTotalVal] = useState(0);
  const menuSelectItem = useSelector((state) => state.menuSelectItem.item);
  const walletAddress = useSelector((state) => state.walletAddress.address);
  const walletChain = useSelector((state) => state.walletChain.chain);
  const walletProtocol = useSelector((state) => state.walletProtocol.protocol);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);



  useEffect(() => {
    //console.log(location.pathname.split("/")[1]);

    // console.log(res)

    switch (location.pathname.split("/")[1]) {
      case "wallet":
        dispatch({ type: SELECT_MENU, payload: 0 });
        break;
      case "portfolio":
        dispatch({ type: SELECT_MENU, payload: 1 });
        break;
      case "help":
        dispatch({ type: SELECT_MENU, payload: 2 });
        break;
      default:
    }
    //console.log(allowedMenu && openMenu);
  }, [/*Menu*/]);

  const downloadWalletData = useCallback(async () => {
    console.log("Menu.js", walletAddress, walletChain, walletProtocol);
    if (typeof walletAddress != "undefined" && walletAddress.length > 0) {
      dispatch({ type: PORTFOLIO_DATA, payload: [] });
      dispatch({ type: FOOTNOTES_DATA, payload: [] }); //https://git.heroku.com/guarded-beach-12345.git

      setIsLoading(true);
      setProgressVal(0);

      let maxTryCnt = 20;
      while (maxTryCnt--) {
        try {
          await axios.post(
              `${SERVE_URL}/wallet/${walletAddress}${walletChain ? "/" + walletChain : ""}${walletProtocol ? "/" + walletProtocol : ""}` //TODO: Multi chain
            );
          break;
        } catch(e) {

        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (maxTryCnt != 0) {
        interval = setInterval(async () => {
          try {
            let response = await axios.get(
              `${SERVE_URL}/status/${walletAddress}${walletChain ? "_" + walletChain : ""}${walletProtocol ? "_" + walletProtocol : ""}`
            );
            response = response.data;
            if (response.progress) {
              setTotalVal(response.total);
              setCurrentVal(response.current);
              setChainVal(response.chain);
              setProgressVal(response.progress);
            } else if (response.result) {

              completeResult(response);
              console.log(response);

            }
          } catch (e) {
            //console.log("status err", e);
          }
        }, 3200);
      } else {
        setIsLoading(false);
        setProgressVal(0);
      }
    }
  });

  useEffect(() => {
    downloadWalletData();
  }, [walletAddress]);
  const onMenuClick = (index) => {
    if ((walletAddress === "" || walletAddress === undefined) && index === 1) {
      index = 0;
      notify();
    }
    dispatch({ type: SELECT_MENU, payload: index });
  };

  const notify = () =>
    toast.warn("Please enter wallet address before clicking on Portfolio");

  const completeResult = (payload) => {
    setProgressVal(100);
    clearInterval(interval);
    setTimeout(() => {
      const portData = payload.result ?? [];
      const footnoteData = payload.footnotes ?? [];
      dispatch({ type: PORTFOLIO_DATA, payload: portData });
      dispatch({ type: FOOTNOTES_DATA, payload: footnoteData });
      setIsLoading(false);
    }, 1000);
  };

  // const handleOpenJSON = (e) => {
  //   var input, file, fr;
  //   console.log(e.target.files[0]);
  //   file = e.target.files[0];
  //   fr = new FileReader();
  //   fr.onload = receivedText;
  //   fr.readAsText(file);
  //   var a = document.getElementById("open_json_file");
  //   a.value = "";
  // };
  /*function receivedText(e) {
    let lines = e.target.result;
    let userData = null;

    try {
      userData = JSON.parse(lines);
    } catch (e) {
      userData = lines;
    }

    dispatch({ type: PORTFOLIO_DATA, payload: userData });

    //  navigate("/portfolio/"+walletAddress, { replace: true });
  }*/

  return (
    <>
      {isLoading ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            backgroundColor: "#10003044",
            zIndex: 100000,
          }}
        >
          {/* <div id="loader"></div> */}
          <div
            style={{
              paddingLeft: "25%",
              paddingRight: "25%",
              paddingTop: 500,
              color: "#fff",
            }}
          >
            {/* <ProgressBar completed={progressVal} maxCompleted={100} /> */}
            <ProgressBarLine
              trailWidth={2}
              strokeWidth={2}
              styles={{
                path: {
                  stroke: "#2dca73",
                },
                text: {
                  fill: "#fff",
                },
              }}
              value={progressVal}
            />
            <div style={{ textAlign: "center", color: "#fff" }}>
              {totalVal
                ? `Calculating ${chainVal} P&L (Position ${currentVal} of  ${totalVal})`
                : `Analyzing ${chainVal}`}
            </div>
          </div>
        </div>
      ) : null}
      <div className={`${(allowedMenu) ? (openMenu ? 'sidebar-appear' : 'sidebar-disappear') : ''} d-lg-block sidebar`}>
        <div onClick={() => { updateMenu(); }} className="cross d-block d-lg-none">&times;</div>
        {/* <DefaultIcon/> */}

        {/* <CryptoIcon  name={"eth"} type={"color"} size={32} /> */}
        <div className=" defi-logo">
          <div className="logo d-flex">
            <img className="defi-image" src={`${process.env.PUBLIC_URL}/assets/images/defi-icon.jpg`} alt="" />
            <h4 className="defi-title">DefiReturn</h4>
          </div>
        </div>
        <nav className="navbar bg-light left-navbar">
          <ul className="navbar-nav">
            <Link className="nav-link" to="/wallet">
              <li
                className="nav-item  d-flex"
                onClick={() => {
                  onMenuClick(0); updateMenu();
                }}
                style={{
                  backgroundColor: menuSelectItem === 0 ? "#081945" : "#14224f",
                }}
              >
                <img className="menu-icon" src={`${process.env.PUBLIC_URL}/assets/images/wallet.jpg`} alt="" />
                <h6 className="menu-item-text">Wallet</h6>
              </li>
            </Link>
            <Link
              className="nav-link"
              to={
                walletAddress !== "" && walletAddress !== undefined
                  ? "/portfolio/" + walletAddress
                  : "/wallet"
              }
            >
              <li
                className="nav-item d-flex"
                onClick={() => { onMenuClick(1); updateMenu(); }}
                style={{
                  backgroundColor:
                    walletAddress !== ""
                      ? menuSelectItem === 1
                        ? "#081945"
                        : "#14224f"
                      : "#14224f",
                }}
              >
                <img className="menu-icon" src={`${process.env.PUBLIC_URL}/assets/images/portfolio.jpg`} alt="" />
                <h6 className="menu-item-text">Portfolio</h6>
              </li>
            </Link>
            <Link className="nav-link" to="/help">
              <li
                className="nav-item d-flex"
                onClick={() => { onMenuClick(2); updateMenu(); }}
                style={{
                  backgroundColor: menuSelectItem === 2 ? "#081945" : "#14224f",
                }}
              >
                <img className="menu-icon" src={`${process.env.PUBLIC_URL}/assets/images/help.jpg`} alt="" />
                <h6 className="menu-item-text">Help</h6>
              </li>
            </Link>
          </ul>
          {/* <span className="btn btn-default btn-file">
            open JSON File{" "}
            <input
              type="file"
              id="open_json_file"
              name="front"
              onChange={(e) => handleOpenJSON(e)}
              className="ImageUpload"
              accept="json/*"
            />
          </span> */}
        </nav>
        <div className="menu-image-div">
          <img className="menu-image" src={`${process.env.PUBLIC_URL}/assets/images/menu-image.jpg`} alt="" />
        </div>
        <nav className="navbar bg-light left-navbar left-navbar-1"></nav>

        <ToastContainer />
      </div>
    </>
  );
};
const mapStateToProps = (state) => ({
  menuSelectItem: state.menuSelectItem,
  walletAddress: state.walletAddress,
});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(Menu);

import React, { useEffect } from "react";
import { useLocation } from 'react-router-dom'
// import Account from "./Account";
import { useDispatch } from 'react-redux'
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
// import { browserHistory } from 'react-router';
// import RLogin, { RLoginButton } from '@rsksmart/rlogin'
//import theme from "./theme";
// import WalletConnectProvider from '@walletconnect/web3-provider'
import Layout from "./Layout";
import ConnectButton from "./ConnectButton";
import AccountModal from "./AccountModal";
import { CHANGE_WALLET, CHANGE_PROTOCOL, CHANGE_CHAIN } from "../actionTypes";



const Header = ({ history, openMenu, updateMenu, allowMenu }) => {
  const location = useLocation();
  const dispatch = useDispatch()
  //const [headerTitle, setHeaderTitle] = useState(location.pathname)
  //const [loading, setLoading] = useState(false);
  //const [provider, setProvider] = useState(null)
  //const [account, setAccount] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    //console.log(headerTitle, 'account---', location.pathname.split('/')[2])
    console.log("Header.js", location.pathname.split('/')[3]);
    dispatch({ type: CHANGE_WALLET, payload: location.pathname.split('/')[2] });
    dispatch({ type: CHANGE_CHAIN, payload: location.pathname.split('/')[3] });
    dispatch({ type: CHANGE_PROTOCOL, payload: location.pathname.split('/')[4] });
  }, [/*Header*/]);


  return (

    <div className="d-flex header-div">
      {/* <Account/> */}
      <ChakraProvider >
        <Layout>
          <div className="d-flex header-title-div">
            <div onClick={() => { updateMenu(); allowMenu(true); }} className="d-block d-lg-none burger col-xs-3 col-sm-1 col-md-1 col-lg-0">
              <span className="burger__span"></span>
              <span className="burger__span"></span>
              <span className="burger__span"></span>
            </div>
            <h3 className="header-title text-left col-xs-9 col-sm-4 col-md-4 col-lg-5">{location.pathname.split('/')[1] !== "" ? location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1) : 'Wallet'}</h3>

            <div className="wallet-button col-xs-0 col-sm-7 col-md-7 col-lg-7">
              <ConnectButton handleOpenModal={() => { }} />
              <AccountModal isOpen={isOpen} onClose={onClose} />
            </div>
          </div>
        </Layout>
      </ChakraProvider>
    </div>
  )
}
export default Header

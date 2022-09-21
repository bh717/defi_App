import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Box, Text } from "@chakra-ui/react";
import { connect, useSelector, useDispatch } from 'react-redux'
import Identicon from "./Identicon";
import { ethers } from 'ethers';
import { CHANGE_WALLET, SELECT_MENU } from "../actionTypes";
// import { rootReducer } from '../reducers';


// interface WalletAddress {
//   address: '';
// }
const ConnectButton = ({ handleOpenModal }) => {
  const navigate = useNavigate();
  // const { activateBrowserWallet, account } = useEthers();
  //const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch()
  const wallet = useSelector(state => state.walletAddress);
  const [walletAddress, setWalletAddress] = useState('')

  // useEffect(() => {
  //   setWalletAddress(account)
  //   if(account!=""&&account!=null)dispatch({type:CHANGE_WALLET,payload:isAuthenticated?account:""})
  // },[isAuthenticated]);

  useEffect(() => {
    setWalletAddress(wallet.address)
    /*if (wallet.address !== undefined)
      dispatch({ type: CHANGE_WALLET, payload: wallet.address })*/
  }, [wallet.address]);

  // function handleConnectWallet() {
  //   console.log(chainId,'chainid---****',account,isAuthenticated)
  //   authenticate()
  // }

  const connect = async () => {

    try {
      const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any")
      await userProvider.send("eth_requestAccounts", []);
      const signer = userProvider.getSigner()
      const wallet = await signer.getAddress()
      navigate(`/portfolio/${wallet}`);
      dispatch({ type: CHANGE_WALLET, payload: wallet })
      dispatch({ type: SELECT_MENU, payload: 1 });
    } catch (e) {

    }
  }

  return walletAddress && walletAddress !== "" ? (
    <Box
      display="flex"
      alignItems="center"
      background="gray.700"
      borderRadius="xl"
      py="0"
    >
      <Box px="3">
        <Text color="white" fontSize="md">
          Connected
        </Text>
      </Box>
      <Button
        onClick={handleOpenModal}
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "blue.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          {walletAddress &&
            `${walletAddress.slice(0, 6)}...${walletAddress.slice(
              walletAddress.length - 4,
              walletAddress.length
            )}`}
        </Text>
        <Identicon />
      </Button>
    </Box>
  ) : (
    <Button
      onClick={connect}
      bg="blue.800"
      color="blue.300"
      fontSize="lg"
      fontWeight="medium"
      borderRadius="xl"
      border="1px solid transparent"
      _hover={{
        borderColor: "blue.700",
        color: "blue.400",
      }}
      _active={{
        backgroundColor: "blue.800",
        borderColor: "blue.700",
      }}
    >
      Connect Wallet
    </Button>
  );
}
const mapStateToProps = (state) => ({
  walletAddress: state.walletAddress
})

export default connect(mapStateToProps)(ConnectButton);
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Router, Route, Switch } from "react-router";
import { useState } from "react";
import Menu from "./Components/Menu";
import Portfolio from "./Components/Portfolio.js";
import Help from "./Components/Help.js";
import Wallet from "./Components/Wallet.js";
import Header from "./Components/Header.js";
// import Brand from "./Components/Brand";
// import Error from "./Components/Error";
import { connect } from 'react-redux'
import './logo.svg';
import './App.css';
import './style.css'

function App() {
  //const wallet = useSelector(state => state.walletAddress);
  const [openMenu, setOpenMenu] = useState(false);
  const [allowedMenu, setAllowedMenu] = useState(false);

  const updateMenu = () => {
    setOpenMenu(openMenu => !openMenu)
  }

  const allowMenu = (val) => {
    setAllowedMenu(allowedMenu => val)
  }


  return (
    <div className="App">
      <Router>
        <div className="d-flex">
          <Menu allowedMenu={allowedMenu} updateMenu={updateMenu} openMenu={openMenu} />
          <div className="board">
            <Header allowedMenu={allowedMenu} allowMenu={allowMenu} updateMenu={updateMenu} openMenu={openMenu} />
            <Routes>
              <Route exact path="/" element={<Wallet allowMenu={allowMenu} allowedMenu={allowedMenu} openMenu={openMenu} updateMenu={updateMenu} />} />
              <Route key={3} path="/wallet" element={<Wallet allowMenu={allowMenu} allowedMenu={allowedMenu} openMenu={openMenu} updateMenu={updateMenu} />} />
              <Route key={1} path="/portfolio/:id" element={<Portfolio allowMenu={allowMenu} allowedMenu={allowedMenu} openMenu={openMenu} updateMenu={updateMenu} />} />
              <Route key={1} path="/portfolio/:id/:chain" element={<Portfolio allowMenu={allowMenu} allowedMenu={allowedMenu} openMenu={openMenu} updateMenu={updateMenu} />} />
              <Route key={1} path="/portfolio/:id/:chain/:protocol" element={<Portfolio allowMenu={allowMenu} allowedMenu={allowedMenu} openMenu={openMenu} updateMenu={updateMenu} />} />
              <Route key={2} path="/help" element={<Help allowMenu={allowMenu} allowedMenu={allowedMenu} openMenu={openMenu} updateMenu={updateMenu} />} />

            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

const mapStateToProps = state => ({
  portfolio_data: state.counterApp,
  wallet_address: state.walletAddress
})

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(App);
// export default App;

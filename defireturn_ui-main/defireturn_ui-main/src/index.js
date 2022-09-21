import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './reducers';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DAppProvider } from "@usedapp/core";


// function importAll(r) {
// 	let images = {};
//   r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
// 	return images
// }

// const images = importAll(require.context('./assets', true, /\.(png|jpe?g|svg)$/));


// console.log(images)

const store = createStore(rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
ReactDOM.render(

  <React.StrictMode> 
    <DAppProvider config={{}}>
      <Provider store={store}>
        <App />
      </Provider>
    </DAppProvider>   
  </React.StrictMode>
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

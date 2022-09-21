const Sentry = require("@sentry/node");
const Utils = require("./utils");
const express = require("express");
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');

const router = require("./routes/api/router");
const Moralis = require("./helpers/moralis");
const swaggerUi = require("swagger-ui-express");

const swaggerJSDoc = require("swagger-jsdoc");

const { CONFIG, ENVIRONMENT } = require("./config");

const PORT = process.env?.PORT || 2083;
const app = express();

console.log(ENVIRONMENT);
console.log(CONFIG);

//Body-parser middleware
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
//CORS policy
app.use(cors());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Defireturn App API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./routes/api/*.js"], // files containing annotations as above
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

Sentry.init({
  environment: ENVIRONMENT == "dev" ? "development" : "production",
  dsn: CONFIG.dsn,
  debug: false,
  tracesSampleRate: 1.0,
});

Utils.createDirIfNoExist("history");

app.use(Sentry.Handlers.requestHandler());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept");

  // Pass to next layer of middleware
  next();
});

mongoose.connect(CONFIG.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database Connected");
    app.listen(PORT, () => {
      console.log(`Server running at (http://localhost:${PORT})`);
    });
    
    Moralis.init();

  })
  .catch(err => {
    console.log(err);
  });

// routes
app.use(router);

app.use(Sentry.Handlers.errorHandler());

//test url::::: http://localhost:2083/wallet/0xcb16f82e5949975f9cf229c91c3a6d43e3b32a9e/polygon
// test avalanche: http://localhost:2083/wallet/0xf8aae8d5dd1d7697a4ec6f561737e68a2ab8539e/avalanche
// test avalanche: http://localhost:2083/wallet/0xf8aae8d5dd1d7697a4ec6f561737e68a2ab8539e/bsc
// http://localhost:2083/wallet/0xbecb0c28c4a9358e987c2916dc088df12374f036/avalanche
// http://localhost:2083/wallet/0xf8aae8d5dd1d7697a4ec6f561737e68a2ab8539e/bsc   //Withdrawal in bsc
// http://localhost:2083/wallet/0xa4c8d9e4ec5f2831701a81389465498b83f9457d

let testData = {
  //wallet: "0x704111eDBee29D79a92c4F21e70A5396AEDCc44a", //biggest wallet
  //wallet: "0xa4c8d9e4ec5f2831701a81389465498b83f9457d", //KLIMA, rebasing (complex)
  wallet: "0xf8aae8d5dd1d7697a4ec6f561737e68a2ab8539e", //QuickSwap, simple LP
  //token: '0x510d776fea6469531f8be69e669e553c0de69621',
  //blockheight: 20138207,
  chain: "polygon",
};

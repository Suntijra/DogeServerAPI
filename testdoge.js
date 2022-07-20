var dogecoin = require('node-dogecoin')({
    host: "127.0.0.1",
    port: 22555,
    user: "dom",
    pass: "dom123"
  });

  dogecoin.getbalance("DHETbzrTVBMxEnynWSP6Jq9p2UKBjVTxY4")
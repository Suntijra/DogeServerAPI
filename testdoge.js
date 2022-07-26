var dogecoin = require('node-dogecoin')({
    host: "127.0.0.1",
    port: 44555,
    user: "dom",
    pass: "dom123"
  });
var WIF = ""
  dogecoin.dumpprivkey('ng85Qfyw8cvVsvYuBx3e33bNytNHKRxgx8',function(err,wif){
    if (err) {
      console.log(err);
    }else{
      // console.log("WIF is : " + wif);
      WIF = wif;
    }
  })
  console.log("WIF is : " + WIF);
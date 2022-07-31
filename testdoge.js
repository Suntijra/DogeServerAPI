// var dogecoin = require('node-dogecoin')({
//     host: "127.0.0.1",
//     port: 44555,
//     user: "dom",
//     pass: "dom123"
//   });
// var WIF = ""
//   dogecoin.dumpprivkey('ng85Qfyw8cvVsvYuBx3e33bNytNHKRxgx8',function(err,wif){
//     if (err) {
//       console.log(err);
//     }else{
//       // console.log("WIF is : " + wif);
//       WIF = wif;
//     }
//   })
//   console.log("WIF is : " + WIF);
const bip39 = require('bip39')
arr = []
var mnemonic = bip39.mnemonicToSeed('nZvKupCJXguZkmjqo3zSRE3EN1wS3St1Tg')
mnemonic.then(bytes => bytes.toString('hex')).then((data)=>{
  try {
    var mem =  bip39.entropyToMnemonic('000')
    // console.log("xxx",bip39.generateMnemonic(256))
  console.log("mnem",mem)
  } catch (error) {
    console.log("error",error)
  }
  // console.log("data!!!",data)
  
})

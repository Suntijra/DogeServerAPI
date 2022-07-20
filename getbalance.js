/* A "Hello World" example of using node-dogecoin to access
 * dogecoind via JSON-RPC. Retreives the current wallet balance.
 *
 * Either run dogecoind directly or run dogecoin-qt with the -server
 * command line option. Make sure you have a ~/.dogecoin/dogecoin.conf
 * with rpcuser and rpcpassword config values filled out. Note that
 * newer versions of dogecoin (1.5 and above) don't allow identical
 * your rpc username and password to be identical.
 *
 */

/* Copy config.json.template to config.json and fill in your
 * rpc username and password. */
// var config = require('config.json');

// var dogecoin = require('node-dogecoin')({
//       host: config.rpchost,
//       port: config.rpcport,
//       user: config.rpcuser,
//       pass: config.rpcpassword
//     });

async function main() {
  var dogecoin = require('node-dogecoin')({
    host: "127.0.0.1",
    port: 44555,
    user: "dom",
    pass: "dom123"
  });
  var x;
  console.log('Connecting to dogecoin daemon...');
  console.log('test get balance');
  // console.log('==>', typeof (dogecoin.dumpprivkey('nVaE4P47DsYF5RSN4jjvak8YNLq5Q85ZPH')))
  dogecoin.listunspent((err, tx) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log(tx[0].txid)
    }
  })


  //   x = await dogecoin.getBalance(function (err, balance) {
  //   if (err) {
  //     return console.error('Failed to fetch balance', err.message);
  //   }
  //   console.log('DOGE balance is', balance);
  //   x = balance
  //   return balance

  // });

  // console.log('x=====>', x)
}

main()


// var x 


// text();

// async function text() {
//   var balance =  dogecoin.getBalance( async (err,res)=>{
//     console.log('22222',res)
//     var val = await res;
//     return val;
//   })
//   console.log('33333', balance)
//   return balance
//   // await console.log('x-x-x ',balance)
//   // return balance


//   await dogecoin.getBalance(async function (err, balance) {
//     if (err) {
//       return console.error('Failed to fetch balance', err.message);
//     }
//     console.log('DOGE balance is', balance);

//     x = balance
//   });
// }



// console.log('x=====>', x)
// console.log('d=====>',dogecoin.getBalance())
// console.log('get new address');
// dogecoin.getNewAddress(function (err, address) {
//   if (err) {
//     return console.error('Failed to fetch new address', err.message);
//   }
//   console.log('New address is', address);
// })

/* Builds and signs a raw transaction given a transaction output
 * and its associated private key. Note that these keys are valid
 * on dogecoin testnet and won't be accepted by dogecoind running
 * on the main doge blockchain (real doge addresses start with D).
 */

/* Copy config.json.template to config.json and fill in your
 * rpc username and password. */
// var config = require('config'),
    async = require('async');

// var dogecoin = require('node-dogecoin')({
//       host: config.rpchost,
//       port: config.rpcport,
//       user: config.rpcuser,
//       pass: config.rpcpassword
//     });
/* The transaction. In order to spend a transaction you must know the
 * transaction id, a private key, and the output of the transaction
 * associated with that private key.
 */

var dogecoin = require('node-dogecoin')({
  host: "127.0.0.1",
  port: 22555,
  user: "dom",
  pass: "dom123"
});
var tx = {
  txid: '2d59d45d1f9517f6027020789ba23308b0dde3da80751caa197dcae840685b10',
  vout: 1,
  amount: 1,
  public_address: 'DHETbzrTVBMxEnynWSP6Jq9p2UKBjVTxY4',
  private_key: 'QWb8UQRFf2SoYDsMioSiuxwaCRmndxUmQRVZ3mkkWpfzbDvE1tpa'
};

/* We create a transaction spending the above transaction to this
 * destination public address. */
var destination_address = '9ziie3L6Qc2QWyc8bQDgMsxccd8cjEJkB7';

async.waterfall([
  function (next) {
    /* Inputs is an array of objects specifing the
     * spendable transaction outputs to be included
     * in the new transaction. */
    var inputs = [{ txid: tx.txid, vout: tx.vout }];

    /* Outputs is an object where each key is a public
     * address and each value is the amount to
     * send to that address. */
    var outputs = {};
    /* Leave one DOGE unspent as transaction fee. */
    outputs[destination_address] = tx.amount - 1;

    dogecoin.createRawTransaction(inputs, outputs, next);
  },
  function (unsigned_hex, next) {
    console.log('Raw unsigned transaction', unsigned_hex);

    /* We have a unsigned hex representation of the transaction.
     * To spend it we have sign it with all the private keys of the
     * inputs. Because this private key isn't in our wallet, we must
     * supply the private key as the third parameter. */
    dogecoin.signRawTransaction(unsigned_hex, [], [tx.private_key], next);
  },
  function (response, next) {
    if (!response.complete) {
      next(new Error('Incomplete transaction'));
    } else {
      console.log('Raw signed transaction', response.hex);
      next(null, response.hex);
    }
  },
  function (signed_hex, next) {
    /* Decode the signed transaction so we can print out
     * its JSON representation. */
    dogecoin.decodeRawTransaction(signed_hex, next);
  }
], function (err, decoded) {
  if (err) {
    console.error(err.message);
  } else {
    console.log(JSON.stringify(decoded, null, 4));
  }
});

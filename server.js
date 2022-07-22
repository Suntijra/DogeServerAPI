const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cors = require('cors')
const nodeDoge = require('node-dogecoin')({
  host: "127.0.0.1",
  port: 44555,
  user: "dom",
  pass: "dom123"
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.listen(port, () => console.log(`Listening on port ${port}`))
app.get('/api/server/stop_nodejs', (req, resp) => {
  console.log("Close Server")
  process.exit();
})
app.post("/api/GetRawtransection", (req, resp) => {
  try {
    let public_address = req.body.address
    nodeDoge.dumpprivkey(public_address)
    let tx = {
      txid: 'bb84a2017ecc49a6f3986fd5c861f5895443a50f82041fe0799a05599179b3d1',
      vout: 0,
      amount: 15,
      public_address: 'nVaE4P47DsYF5RSN4jjvak8YNLq5Q85ZPH',
      private_key: 'ciwZ6PuDVkYhCYv3zxP1gSAeCUnz3FczvUxnDNGjm1QdDatgUa9e'
    };

    /* We create a transaction spending the above transaction to this
     * destination public address. */

    let destination_address = '2NAq4QCgu4AatKCGLLPCv3bPER6wYRoCRcb';

    async.waterfall([
      function (next) {
        /* Inputs is an array of objects specifing the
         * spendable transaction outputs to be included
         * in the new transaction. */
        let inputs = [{ txid: tx.txid, vout: tx.vout }];

        /* Outputs is an object where each key is a public
         * address and each value is the amount to
         * send to that address. */
        let outputs = {};
        /* Leave one DOGE unspent as transaction fee. */
        // [{"txid":txid,"vout":n},...] {address:amount,...}
        outputs[destination_address] = tx.amount - 1;
        outputs[tx.public_address] =

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

  } catch (error) {
    console.log(error)
  }
}

)
app.get('/api/getallbal', async (req, resp) => {
  try {
    console.log('---------------------------------')
    console.log('getBalance')
    // let balance = await getBalance()

    nodeDoge.getBalance(function (err, balance) {
      if (err) {
        console.error('Failed to fetch balance', err.message);
        return resp.status(500).json({
          message: "Failed to fetch balance" + err.message,
          code: 500
        })
      }
      else {
        console.log('DOGE balance is', balance);
        return resp.status(200).json({
          message: 'Success',
          balances: balance,
          code: "ok"
        })
      }

    });

  } catch (err) {
    return resp.status(500).json({
      message: "" + err
    })
  }

})

app.post("/api/createAddressByUser", (req, resp) => {
  try {
    let user = req.body.username;
    console.log('user:', user)
    nodeDoge.getnewaddress(user)
    return resp.status(200).json({ status: 'success', "username": user })
  } catch (error) {
    return resp.status(500).json({ status: 'error', message: error.message })
  }
})

app.post("/api/getbalanceByUser", (req, resp) => {
  try {
    let user = req.body.username;
    // console.log('user:',user)
    nodeDoge.getbalance(user,(err, balance) => {
      if (err) {
        return resp.status(500).json({ status: 'error', message: err.message })
      }
      else {
        console.log("balance by account:", balance)
        return resp.status(200).json({
          message: 'Success',
          balances: balance,
          code: "ok"
        })
      }
    })
    // return resp.status(200).json({ status: 'success' ,"username": user})
  } catch (error) {
    return resp.status(500).json({ status: 'error', message: error.message })
  }
})
// async function getBalance() {
//    await nodeDoge.getBalance( function (err, balance) {
//     if (err) {
//       console.error('Failed to fetch balance', err.message);
//     }
//     console.log('DOGE balance is', balance);
//     return  balance
//   });
// }
// function getaccountaddress() {
//   nodeDoge.getaccountaddress((err, address) => {
//     if (err) {
//       console.error('Failed to fetch address', err.message);
//     }
//     // console.log('DOGE address is', address);
//     return address
//   }
//   )
// }

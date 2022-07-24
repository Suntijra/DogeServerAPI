const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
// const router = require('./router/Router')
// const app = express()
const axios = require('axios').default;
const MD5 = require('js-md5');
var jwt = require('jsonwebtoken');
// var cors = require('cors')
const jwtsecret = 'Unitdogecoin-wallet';
// const port = 8000
const WAValidator = require('wallet-address-validator');
const { request } = require('express');
const jwt_secretPk = 'mydogecoin-private-key';
// const express = require('express')
const app = express()
const port = 3000
// const bodyParser = require('body-parser')/
const cors = require('cors');
const { countBy } = require('lodash');
const nodeDoge = require('node-dogecoin')({
  host: "127.0.0.1",
  port: 44555,
  user: "dom",
  pass: "dom123"
});

// server Unit
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://dom:dom123@167.99.71.116:27017/?directConnection=true&appName=mongosh+1.5.0&authMechanism=DEFAULT";
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())


app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.listen(port, () => console.log(`Listening on port ${port}`))

// ==================================  หน้าบ้าน  ==================================

//api rounting
app.get("/api/get/register", async (req, res) => {
  console.log("-------------------------------")
  console.log('Use API:', '/api/get/register')
  try {
    data = await get_all_register()

    return res.status(200).json({
      Result: data,
      Code: 200
    })
  }
  catch (err) {
    return res.status(500).json({
      Result: err,
      Code: 500
    })
  }
});
app.get('/', (req, res) => {
  res.json({ message: 'enjoy mydogecoin wallet' });
});

// singup ===> insertOne Data
app.post('/api/insert/register', async (req, res) => {
  console.log("-------------------------------")
  console.log('Use API:', '/api/insert/register')
  try {
    let username = _.get(req, ["body", "username"]);
    let password = _.get(req, ["body", "password"]);
    console.log('user pass=====>', username, password.length)
    if (username.length > 0 && password.length > 0 && typeof (username) === 'string' && typeof (password) === 'string') {
      username = MD5(username)
      password = MD5(password)
      const check_length = await queryUser(username)
      console.log(username)

      if (check_length[0] == 0) {
        Registerdb(username, password)
        console.log('Success')
        return res.status(200).json({
          Result: 'Register Success',
          Code: 200,
          status: true
        })
      } else if (check_length[1][0].username == username) {
        console.log('Check User count :', check_length[1].length)
        if (check_length[1][check_length[1].length - 1].status_reset == true) {
          Registerdb(username, password)
          console.log('Success')
          return res.status(200).json({
            Result: 'Register Success',
            Code: 200,
            status: true
          })
        } else {
          console.log('Username already exists')
          return res.status(200).json({
            Result: 'Username already exists',
            status: false
          })
        }

      }
      else {
        return res.status(400).json({
          Result: 'Server cannot connect to database',
          Code: 404,
          status: false,
          Log: 1
        })
      }
    } else {
      console.log(5)
      return res.status(400).json({
        Result: 'Server cannot connect to database',
        Code: 404,
        status: false
      })
    }
  }
  catch (err) {
    console.log(err)
    return res.status(400).json({
      Result: 'Server cannot connect to database',
      Code: 404,
      Log: 0
    })
  }



})
// login ===> findOne Database
app.post('/api/post/login', async (req, res) => {
  try {
    let user = _.get(req, ["body", "username"]);
    let pwd = _.get(req, ["body", "password"]);
    user = MD5(user)
    pwd = MD5(pwd)
    let date = new Date()
    let token = pwd + user + "mydogecoin-wallet" + date.getTime() + "Unitdogecoin";
    let data = await queryLogin(user, pwd)
    if (data[0] != 0) {
      // check มี username && pass อยู่ในฐานข้อมูล
      // console.log("token:", token)
      token = jwt.sign({ 'username': user, token: token }, jwtsecret, { expiresIn: '1D' });
      // console.log("token: " + token)
      insertToken(token)
      console.log("Insert Token Success")
      // console.log('data====>',data[1][0].username)
      nodeDoge.getaddressesbyaccount(data[1][0].username,(err,count)=>{
        if(err){
          console.log(err)
          return res.status(500).json({
            status:"err",
            log:0
          })
        }else{

          return res.status(200).json({
            Result: 'Login Success',
            status: 'success',
            token: token,
            addr_count:count.length,
            log:1
          })
        }
      })
    } else {
      return res.status(200).json({
        Result: 'Login Failed',
        status: 'error',
        log:2
      })
    }
  } catch {
    return res.status(400).json({
      Result: 'Server cannot connect to database',
      Code: 404,
      status: false,
      log:3
    })
  }

})
app.post('/api/post/import-wallet', async (req, res) => {
  let pk_token = '';
  try {
    let pk = _.get(req, ["body", "pk"]);
    if (pk != '' || pk != undefined || pk != null || pk != 'null' || pk != 'undefined' || pk != ' ') {
      pk_token = jwt.sign({ pk: pk }, jwt_secretPk);
      let valid = WAValidator.validate(pk, 'DOGE');
      if (valid) {
        console.log('This is a valid address');
        return res.status(200).json({ status: 'ok', pk: pk_token })
      }
      else {
        console.log('Address INVALID');
        return res.status(200).json({ status: 'fail', pk: pk_token })
      }

    } else {
      return res.status(200).json({ status: 'Not found pk', pk: pk })
    }
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      status: 'fail'
    })
  }

})
app.post('/api/post/create-wallet', async (req, res) => {
  try {
    let token = req.body.token;
    console.log("create wallet:", token)
    let decoded = jwt.verify(token, jwtsecret);
    console.log("decoded username:", decoded.username)
    axios.post("http://167.99.71.116:3000/api/createAddressByUser", {
      "username": decoded.username
    }).then((response) => {
      console.log(response.data)
      return res.status(200).json({ status: 'ok' })
    }).catch((error) => {
      console.log(error)
      return res.status(400).json({ msg: "cannot connect to server" })
    })
    // return res.status(200).json({ msg: '???????????????????' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 'fail', error: error, msg: 'Server cannot connect to database' })
  }


})
app.post('/api/post/getbalance', async (req, res) => {
  try {
    let token = req.body.token;
    // console.log("token", token)
    let decoded = jwt.verify(token, jwtsecret);
    console.log("decoded username:", decoded.username)
    await axios.post("http://167.99.71.116:3000/api/getbalanceByUser", { "username": decoded.username })
      .then((response) => {
        console.log(response.data)
        return res.status(200).json({ status: 'ok', balance: response.data })
      }).catch(error => {
        console.log(error)
        return res.status(400).json({ msg: "cannot connect to server" })
      })

  }
  catch (error) {
    console.log(error)
    return res.status(500).json({ status: 'fail', error: error, msg: 'Server cannot connect to database' })
  }
})
// check authorization
app.post('/api/post/authen', async (req, resp) => {
  try {
    let token = req.headers.authorization.split('Bearer ')[1];
    token = await queryToken(token)
    // console.log("====>",token[1][0].token)
    if (token[0] != 0) {
      return resp.status(200).json({
        status: 'ok',
        msg: "authen success"
      })
    }
    else {
      return resp.status(200).json({
        status: 'error',
        msg: "not found authen"
      })
    }
  } catch (err) {
    console.log(err)
    return resp.status(400).json({
      Result: 'Server cannot connect to database',
      Code: 404,
      status: false
    })
  }
})

async function get_all_register() {
  var a = await MongoClient.connect(url)
  var dbo = await a.db("mydogecoin-wallet");
  var result = await dbo.collection("register").find({}).toArray();
  return result
}

function Registerdb(user, pass, S_reset = false, S_login = true) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydogecoin-wallet");
    var myobj = { username: user, password: pass, status_reset: S_reset, status_login: S_login};
    dbo.collection("register").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

function insertToken(token) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydogecoin-wallet");
    var myobj = { token: token };
    dbo.collection("token").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 token inserted");
      db.close();
    });
  });
}

async function queryToken(token) {

  let client = await MongoClient.connect(url)
  let dbo = await client.db("mydogecoin-wallet");
  let query = { 'token': token };
  let result = await dbo.collection("token").find(query).toArray();
  // console.log("queryToken: " + JSON.stringify(result));
  return [result.length, result];
}

async function queryLogin(user, pass) {
  var client = await MongoClient.connect(url)
  var dbo = await client.db("mydogecoin-wallet");
  var query = { username: user, password: pass };
  var result = await dbo.collection("register").find(query).toArray();
  return [result.length, result];

}
async function queryUser(user) {
  var client = await MongoClient.connect(url)
  var dbo = await client.db("mydogecoin-wallet");
  var query = { username: user };
  var result = await dbo.collection("register").find(query).toArray();
  return [result.length, result];

}

// ==================================  dogecore server  ==================================
app.get('/api/server/stop_nodejs', (req, resp) => {
  console.log("Close Server")
  process.exit();
})
app.post("/api/Send/Rawtransection", (req, resp) => {
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
    nodeDoge.getreceivedbyaccount(user, (err, received) => {
      if (err) {
        return resp.status(500).json({ status: 'error', message: err.message })
      }
      else {
        console.log("balance by account:", received)
        return resp.status(200).json({
          message: 'Success',
          balances: received,
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

// =============================================================================================================================================================================================

app.post('/api/admin/sendDoge/anotherOnLocalBalance', (req, res) => {
  try {
    let fromaccount = req.body.fromAccount;
    let toaccount = req.body.toAccount;
    let amount = req.body.amount;
    nodeDoge.getbalance(fromaccount, (err, checkbalance) => {
      if (err) {
        res.status(404).json({
          msg: "Failed to send doge not found account ",
          status: "fail",
          log: 0
        });
      } else if (checkbalance >= amount) {
        nodeDoge.getaddressesbyaccount(toaccount, (err, address) => {
          if (err) {
            res.status(404).json({
              msg: "Failed to send doge not found account",
              status: "fail",
              log: 1
            });
          }
          else {
            console.log('address===>', address[0])
            nodeDoge.sendfrom(fromaccount, address[0], amount, (err, txid) => {
              if (err) {
                console.error(err);
                res.status(404).json({
                  msg: "Failed to send doge on local balance",
                  status: "fail",
                  log: 2
                });
              } else {
                res.status(200).json({
                  status: 'Success',
                  message: 'Sent doge on local balance',
                  txid: txid,
                  log: 3
                });
              }

            })
          }
        })
      }
      else {
        res.status(400).json({
          status: 'Failed',
          message: 'error',
          log: 4
        });
      }
    })



  } catch (error) {
    return res.status(404).json({
      message: errors,
      status: 'error',
    });
  }
})
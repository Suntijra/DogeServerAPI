const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const axios = require('axios').default;
const MD5 = require('js-md5');
var jwt = require('jsonwebtoken');
const jwtsecret = 'Unitdogecoin-wallet';
const WAValidator = require('wallet-address-validator');
const { request, response, query } = require('express');
const jwt_secretPk = 'mydogecoin-private-key';
const app = express()
const port = 3000
const cors = require('cors');
const { countBy, set } = require('lodash');
const { array } = require('js-md5');
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
    console.log('user pass=====>', username, password)
    if (username.length > 0 && password.length > 0 && typeof (username) === 'string' && typeof (password) === 'string') {
      username = MD5(username)
      password = MD5(password)
      const check_length = await queryUser(username)
      // console.log(username)
      let date = new Date()
      let account_name = MD5(password + username + "mydogecoin-wallet" + date.getTime() + "Unitdogecoin" + (Math.random() * 10000000));
      console.log(account_name)
      if (check_length[0] == 0) {
        Registerdb(username, password, account_name)
        console.log('Success')
        return res.status(200).json({
          Result: 'Register Success',
          Code: 200,
          status: true
        })
      } else if (check_length[1][0].username == username) {
        console.log('Check User count :', check_length[1].length)
        if (check_length[1][check_length[1].length - 1].status_reset == true) {
          Registerdb(username, password, account_name)
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
  console.log("/api/post/login")
  try {
    let user = _.get(req, ["body", "username"]);
    let pwd = _.get(req, ["body", "password"]);
    user = MD5(user)
    pwd = MD5(pwd)
    let data = await queryLogin(user, pwd)
    console.log("length login ==>>>>", data[0])
    if (data[0] == 1) {
      let date = new Date()
      let token = jwt.sign({ username: user, account: data[1][0].account, time: date.getTime() }, jwtsecret, { expiresIn: '1D' });
      insertToken(token)
      console.log("Insert Token Success")
      console.log('data====>', data[1][0].account)
      nodeDoge.getaddressesbyaccount(data[1][0].account, (err, count) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            status: "err",
            log: 0
          })
        } else {

          return res.status(200).json({
            Result: 'Login Success',
            status: 'success',
            token: token,
            addr_count: count.length,
            log: 1
          })
        }
      })
    } else {
      return res.status(200).json({
        Result: 'Login Failed',
        status: 'error',
        log: 2
      })
    }
  } catch {
    return res.status(400).json({
      Result: 'Server cannot connect to database',
      Code: 404,
      status: false,
      log: 3
    })
  }

})
// app.post('/api/post/import-wallet', async (req, res) => {
//   let pk_token = '';
//   try {
//     let pk = _.get(req, ["body", "pk"]);
//     if (pk != '' || pk != undefined || pk != null || pk != 'null' || pk != 'undefined' || pk != ' ') {
//       pk_token = jwt.sign({ pk: pk }, jwt_secretPk);
//       let valid = WAValidator.validate(pk, 'DOGE');
//       if (valid) {
//         console.log('This is a valid address');
//         return res.status(200).json({ status: 'ok', pk: pk_token })
//       }
//       else {
//         console.log('Address INVALID');
//         return res.status(200).json({ status: 'fail', pk: pk_token })
//       }

//     } else {
//       return res.status(200).json({ status: 'Not found pk', pk: pk })
//     }
//   } catch (err) {
//     console.log(err)
//     return res.status(400).json({
//       status: 'fail'
//     })
//   }

// })
app.post('/api/post/create-wallet', async (req, res) => {
  console.log('/api/post/create-wallet')
  try {
    let token = req.body.token;
    console.log("create wallet:", token)
    let decoded = jwt.verify(token, jwtsecret);
    console.log(decoded)
    console.log("decoded username:", decoded.account)
    axios.post("http://167.99.71.116:3000/api/createAddressByUser", {
      "username": decoded.account
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
  console.log('/api/post/getbalance')
  try {
    let token = req.body.token;
    // console.log("token", token)
    let decoded = jwt.verify(token, jwtsecret);
    console.log("decoded username:", decoded.account)
    await axios.post("http://167.99.71.116:3000/api/getbalanceByUser", { "username": decoded.account })
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
  console.log("/api/post/authen")
  try {
    let token = req.headers.authorization.split('Bearer ')[1];
    // let decoded = jwt.verify(token, jwtsecret);
    token = await queryToken(token)
    // console.log(token)
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

function Registerdb(user, pass, account_name, S_reset = false, S_login = true) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydogecoin-wallet");
    var myobj = { username: user, password: pass, account: account_name, status_reset: S_reset, status_login: S_login };
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
async function queryPWD(pwd) {
  var client = await MongoClient.connect(url)
  var dbo = await client.db("mydogecoin-wallet");
  var query = { password: pwd };
  var result = await dbo.collection("register").find(query).toArray();
  return [result.length, result];

}

async function makelistTXID_byUser(regis_id) {
  try {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const col = client.db("mydogecoin-wallet").collection('TXID-By-User');
    arr = []
    const myobj = { userID: regis_id, listtxid: arr };
    const result = await col.insertOne(myobj);
    client.close();
    console.log(result);
    // updateFunc(objectTX)
    console.log("-------- make list TX Finished --------")
    if (result) {
      console.log("======> log")
      return true
    } else {
      return false
    }

  }
  catch (err) {
    console.log(err);
  }
}




// ==================================  dogecore server  ==================================
app.get('/api/server/stop_nodejs', (req, resp) => {
  console.log("Close Server")
  process.exit();
})
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
  console.log("/api/createAddressByUser")
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
  console.log("/api/getbalanceByUser")
  try {
    let user = req.body.username;
    // console.log('user:',user)
    nodeDoge.getbalance(user, (err, received) => {
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
  console.log("/api/admin/sendDoge/anotherOnLocalBalance")
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
            nodeDoge.sendfrom(fromaccount, address[0], amount, (err, txid) => {
              if (err) {
                console.error(JSON.parse(err.message).error.message);
                let msg = JSON.parse(err.message).error.message
                res.status(404).json({
                  msg: msg,
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
//sendFrom
app.post('/api/sendFrom/', async (req, res) => {
  console.log("/api/sendFrom/")
  try {
    let token = req.body.token;
    let pwd = req.body.password;
    let toaccount = req.body.address;
    let amount = req.body.amount;
    let decoded = jwt.verify(token, jwtsecret);
    let fromaccount = decoded.account
    let data = await queryLogin(decoded.username, MD5(pwd))
    let transaction = async () => {
      let client = await MongoClient.connect(url)
      let dbo = await client.db("mydogecoin-wallet");
      let query = { 'userID': data[1][0]["_id"] };
      let result = await dbo.collection("TXID-By-User").find(query).toArray();
      return result;
    }

    if (data[0] != 1) {
      console.log('password is incorrect')
      return res.status(400).json({
        status: 'failed',
        msg: 'password is incorrect',
        log: 3
      })
    }

    let userid = data[1][0]["_id"]
    nodeDoge.sendfrom(fromaccount, toaccount, amount, async (err, txid) => {
      if (err) {
        let msg = JSON.parse(err.message).error.message
        return res.status(400).json({
          status: 'Failed',
          msg: msg,
          log: 0

        })
      } else {
        let update = async () => {
          nodeDoge.gettransaction(txid, async (err, detailstx) => {
            if (err) {
              let msg = JSON.parse(err.message).error.message
              return res.status(400).json({
                status: 'Failed',
                msg: msg,
                log: "error gettransaction"

              })
            }

            let querylisttx = await transaction()
            console.log("update TXID ...")
            let client = await MongoClient.connect(url)
            let dbo = await client.db("mydogecoin-wallet");
            let query = { userID: userid };
            let listtxid;
            // console.log("transaction list ===>", querylisttx[0])
            let prepush = querylisttx[0]['listtxid']
            console.log('pre = >>>', prepush)
            if (Array.isArray(prepush)) {
              console.log('isArray');

              listtxid = prepush
              listtxid.push({ "txid": txid, "txdetail": detailstx, 'cf': 0 })
            } else {
              console.log("not is array")
              listtxid = [{ 'txid': txid, 'txdetail': detailstx, "cf": 0 }]
            }
            let newTX = { $set: { listtxid: listtxid } };
            dbo.collection("TXID-By-User").updateOne(query, newTX, function (err) {
              if (err) throw err;
              console.log("1 document updated");
            });
          })
        }
        let querylistLength = await transaction()
        if (querylistLength.length == 0) {
          console.log("Make list Transactions ..... ")
          let check = await makelistTXID_byUser(userid)
          if (check) {
            await update()
          }

        } else {
          await update()
        }
        console.log("sent from account: " + fromaccount, " ===> ", fromaccount)
        return res.status(200).json({
          status: 'Success',
          txid: txid,
          log: 1,
          msg: 'Success'
        })
      }

    })
  } catch (error) {
    return res.status(404).json({ error: error, msg: "can't send from server", log: 2 });
  }
})

app.post('/api/listaddress/', (req, res) => {
  console.log("/api/listaddress/")
  try {
    let token = req.body.token;
    let decoded = jwt.verify(token, jwtsecret);
    // console.log("decoded username:", decoded.account)
    let toaccount = decoded.account
    nodeDoge.getaddressesbyaccount(toaccount, (err, listaddress) => {
      if (err) {
        return res.status(400).json({
          status: 'error', message: err, log: 1
        });
      } else {
        return res.status(200).json({
          status: 'ok', listaddr: listaddress, log: 0
        })
      }
    })
  } catch (error) {
    return res.status(404).json({
      error: error, msg: "server error",
      log: 3
    })
  }
})

app.post("/api/getnewaddress", function (req, res) {
  console.log("/api/getnewaddress/")
  try {
    let token = req.body.token;
    let decoded = jwt.verify(token, jwtsecret);
    nodeDoge.getnewaddress(decoded.account, (err, newAddr) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ status: 'new address fail', message: err, log: 0 });
      } else {
        return res.status(200).json({
          status: 'success', newAddr: newAddr, log: 1
        })
      }
    })
  }
  catch (err) {
    return res.status(404).json({
      error: error, msg: "server error",
      log: 5
    })
  }
})

app.post("/api/listtransactions", async (req, res) => {
  try {
    console.log("/api/listtransactions")
    let token = req.body.token;
    let decoded = jwt.verify(token, jwtsecret);
    let data = await queryUser(decoded.username)
    let transaction = async () => {
      let client = await MongoClient.connect(url)
      let dbo = await client.db("mydogecoin-wallet");
      let query = { 'userID': data[1][0]["_id"] };
      let result = await dbo.collection("TXID-By-User").find(query).toArray();
      // console.log(result)
      return result[0];
    }
    // nodeDoge
    let detailTX = await transaction()
    // console.log("detailTX.listtxid.length;",detailTX.listtxid.length)
    for (let i = 0; i < detailTX.listtxid.length; i++) {
      console.log('index',i)
      console.log(detailTX)
      if (detailTX.listtxid[i].cf < 10) {
        nodeDoge.gettransaction(detailTX.listtxid[i].txid, async (err, result) => {
          if (err) {
            let msg = JSON.parse(err.message).error.message
            res.status(500).json({
              log: "error getting transaction",
              msg: msg
            })
          } else {
            console.log(detailTX.listtxid[i].txid, "success confirmations :", result.confirmations)
            let update = async (txids,user) => {
              console.log("update confirmations ...")
              let client = await MongoClient.connect(url)
              let dbo = client.db("mydogecoin-wallet");
              let query = { userID: user,"listtxid.txid" : txids};
              let updateCF = { $set: { "listtxid.$.cf" : result.confirmations ,"listtxid.$.txdetail":result} };
              let resultdb = dbo.collection("TXID-By-User").updateOne(query, updateCF, function (err) {
                if (err) throw err;
                console.log("1 document updated");
              });
            }
            if (result.confirmations > 0) {
              update(detailTX.listtxid[i].txid,detailTX.userID)
            }
          }
        })
      }
    }

    return res.status(200).json({
      msg: "ok",
      log: 1,
      data: await transaction()
    })

  } catch (err) {
    return res.status(400).json({ status: 'error', messages: "server error", log: 5 });
  }
})

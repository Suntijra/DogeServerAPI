const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cors = require('cors')
const nodeDoge = require('node-dogecoin')({
  host: "127.0.0.1",
  port: 22555,
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
app.get('/testget', async (req, resp) => {
  try {
    console.log('---------------------------------')
    console.log('getBalance')
    let balance = await getBalance()
    console.log('balance :',balance)
    console.log('---------------------------------')
    // let account = await getaccountaddress()
    console.log('---------------------------------')
    return resp.status(200).json({
      message: 'Success',
      balances: balance,
      code : "ok"
    })
  } catch (err) {
    return resp.status(500).json({
      message: ""+err
    })
  }

})
async function getBalance() {
   await nodeDoge.getBalance( async function (err, balance) {
    if (err) {
      console.error('Failed to fetch balance', err.message);
    }
    console.log('DOGE balance is', balance);
    return  balance
  });
}
function getaccountaddress() {
  nodeDoge.getaccountaddress((err, address) => {
    if (err) {
      console.error('Failed to fetch address', err.message);
    }
    // console.log('DOGE address is', address);
    return address
  }
  )
}

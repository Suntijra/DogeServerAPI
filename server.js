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

app.get('/testget',(req,resp)=>{
    try{
        console.log('---------------------------------')
        console.log('getBalance')
        getBalance()
        console.log('---------------------------------')
        getaccountaddress()
        console.log('---------------------------------')
        return resp.status(200).json({
            message: 'ok'
        })
    }catch(err){
        return resp.status(500).json({
            message: 'error'
        })
    }
   
})
function getBalance(){
    nodeDoge.getBalance(function(err, balance) {
        if (err) {
          return console.error('Failed to fetch balance', err.message);
        }
        console.log('DOGE balance is', balance);
      });
}
function getaccountaddress(){
    nodeDoge.getaccountaddress('adca609d51ba9b772563095660b442e2c1995178434ab8c565ffdcbdd88fd365')
}
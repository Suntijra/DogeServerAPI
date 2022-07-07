const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cors = require('cors')
const nodeDoge = require('node-dogecoin')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.listen(port, () => console.log(`Listening on port ${port}`))

app.get('/testget',(req,resp)=>{
    console.log('can be test')
    try{
        return resp.status(200).json({
            message: 'ok'
        })
    }catch(err){
        return resp.status(500).json({
            message: 'error'
        })
    }
   
})
const express = require("express")
express.response.statusText = function (statusText) {
    this.statusMessage = statusText
    return this
}
express.response.sendStatus = (statusCode,statusText) => {
    this.statusMessage = statusText
    return this.status(statusCode).send()
}

const articleRouter = require("./routes/article")
const userRouter = require("./routes/user")
const app = express()
const { rsa, configureResponse: {global} , isAuthenticated } = require("./routes/middlewares")
app.use(global)

//app.use(express.bodyParser())
app.use(express.json())

app.use((req,res,next) => {
    var temp = res.send
    res.send = function (data) {
        if(data === undefined) data = res.data
        var resData = rsa.encryptPayload(req,res,data)
        temp.call(this,JSON.stringify(resData))    
    }
    next()
})

app.use(rsa.decryptPayload)
app.use((req,res,next) => {
    console.log('request recieved :\noriginalUri =',req.originalUrl,'\nrequest recieved :\nreq.body =',req.body)
    //return res.status(500).send('error during server')
    next()
})
app.use(isAuthenticated)
app.post('/tlshandshake',(req,res)=>{
    res.send(res.data)
})
app.use("/article",articleRouter)
app.use("/user",userRouter)

module.exports = app;
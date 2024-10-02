const express = require("express")

//  Customizing express response object with a new middleware
//      which sets http response statusText ( statusMessage )
express.response.statusText = function (statusText) {
    this.statusMessage = statusText
    return this
}

const articleRouter = require("./routes/article")
const userRouter = require("./routes/user")
const logRouter = require("./routes/log")
const app = express()
const { rsa, configureResponse: {global} , isAuthenticated } = require("./routes/middlewares")

app.use(global)
app.use(express.json())

//  Firewall at entry gateway decrypts both symmetric and asymmetric encryptions
app.use(rsa.decryptPayload)

//  Logs the requests after decryption for debugging purposes
app.use((req,res,next) => {
    console.log('request recieved :\noriginalUri =',req.originalUrl,'\nrequest recieved :\nreq.body =',req.body)
    next()
    const entry = {
        type:   'request' ,
        ip: req.ip  ,
        method: req.method  ,
        host:   req.hostname ,
        originalUri:    req.originalUri ,
        headers:    req.headers ,
    }

})

//  Firewall at entry gateway attaches the authorization token to the request object
app.use(isAuthenticated)

//  API handling routes
app.post('/tlshandshake',(req,res)=>{
    //  Handling was been done during the asymmetric decryption itself
    res.send()
})
app.use("/article",articleRouter)
app.use("/user",userRouter)
app.use("/log",logRouter)

module.exports = app;
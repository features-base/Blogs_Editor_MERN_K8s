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
const { logRequest, rsa, configureResponse: {global} , isAuthenticated } = require("./routes/middlewares")

app.use(global)
app.use(express.json())

//  Firewall at entry gateway decrypts both symmetric and asymmetric encryptions
app.use(rsa.decryptPayload)

//  Logging incoming http packets at entry gateway
app.use(logRequest)

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
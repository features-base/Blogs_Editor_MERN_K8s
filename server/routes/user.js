const express = require("express")
const router = express.Router();
const crypto = require('crypto')
const { generateKey , protectedRoute , exchangeAuthCode , requestHandler } = require("./middlewares")
const queryString = require('node:querystring'); 
const { UserSessions } = require('../common/session')
var codeVerifier = generateKey(128,'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~')
var codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
console.dir({codeVerifier,codeChallenge})
router.post("/filter", requestHandler.filter)

router.post("/update", protectedRoute, requestHandler.update)

router.post("/search", requestHandler.search)

router.get("/login", async (req,res) => {
    var authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    var authorizationUri = authorizationUrl + "?"

    var redirectUri = process.env.GOOGLE_OAUTH2_REDIRECT_URI
    if(!redirectUri) redirectUri = 'https://localhost:443'
    var uriParameters = queryString.stringify({
        redirect_uri: redirectUri ,
        client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID ,
        response_type: "code",//"id_token token",
        //grant_type: 'pkce',
        scope: "openid profile email",
        nonce: 'n-0S6_WzA2Mj',
        display: 'popup',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'

    })
    authorizationUri += uriParameters
    console.log(authorizationUri)
    return res.redirect( 303 , authorizationUri ) 
})

router.post("/getUserInfo", async(req,res) => {
    const { accessToken , idToken , _id, name , user } = req.body
    if(accessToken !== undefined) 
        return res.redirect(307,req.baseUrl+"/getGoogleOAuth2Claims")
    if(_id !== undefined || name !== undefined || user !== undefined)
        return {}
})

router.post("/getGoogleOAuth2Claims", async(req,res) => {
    var { accessToken , idToken , authorizationCode, editing = {cloud:{},local:{}} } = req.body

    // baseUrl will be of the form api/newEntitys/... , api/users... etc...
    const resourceType = req.baseUrl.split('/')[1]
    const collectionName = resourceType+'s'
    
    if(authorizationCode === undefined && accessToken === undefined) {
        return res.status(400).send({ reason: 'authorizationCode body field required' })
    }
    
    if( ( typeof authorizationCode !== 'string' && !( authorizationCode instanceof String ) )
        &&  ( typeof accessToken !== 'string' && !( accessToken instanceof String )) ) {
        res.statusMessage = 'accessToken field must be a string'
        return res.status(400).send({ reason: 'authorizationCode field must be a string' })
    }
    var claims
    try {
        claims = await exchangeAuthCode({authorizationCode,codeVerifier})
    }
    catch(error) {
        console.dir(error,{depth:5})
        console.log('res.json :',await error.res.json())
        return res.status(500).send("Error during openid protocol execution")
    }

    var newSession = {
        ...req.body.session, accessToken, idToken, userInfo: claims, editing
    }
    req.body = {...req.body , session:newSession, respond:false}

    var session = UserSessions.createSession(newSession)
    var resData = { session: await getSession(req, res) }
    req.authenticated = true

    req.body = {
            ...req.body,
            newEntity: claims,
            upsert: true,
            respond: false
    }
    const result = await requestHandler.update(req,res)
    
    if(!(result.acknowledged && ( result.upsertedCount || result.matchedCount ))) 
        return res.status(207).statusText("The "+resourceType+" is not upserted in DB")
            .send(resData)
    
    return res.send(resData)
    
})

const getSession = async (req,res,next) => {
    var { sessionToken , session , respond=true } = req.body;
    console.log('before getSession :\n',session)
    const result = UserSessions.getSession({sessionToken, session})
    console.log('getSession :\n',result)
    if (respond) {
        if(!result || !(result instanceof Object) || (!result.sessionToken)) {
            res.status(401).send("Please validate your session details. Or try reauthenticating.")
        }
        else res.send({session:result})
    }
    if(next) next(result)
    return(result)
}

const updateSession = async (req,res,next) => {
    var { session , respond=true } = req.body
    const result = await UserSessions.updateSession(session)
    if(respond) {
        if(!result) res.status(401).send("Verify your authentication")
        else res.send("Session updated")
    }
    if(next) next(result)
    return result
}

router.post("/'getSession", getSession)

router.post('/updateSession', updateSession)

router.post('/logout', protectedRoute, async(req,res) => {

    UserSessions.terminateSession(req.sessionToken)

    res.send('Logged Out Successfully.')

})

router.post('/saveCloudSession',protectedRoute,async(req,res) => {
    var { session , sessionToken, cloudSession } = req.body
    if( ( !session || !(session instanceof Object) ) && ( !sessionToken ||(typeof sessionToken !== 'string' && !(sessionToken instanceof String)) ) )
        return res.status(400).statusText("sessionToken required in request body").send("sessionToken or session object must be attached to the request body.")
    if(!sessionToken) sessionToken = session.sessionToken
    if(!sessionToken || (typeof sessionToken !== 'string' && !(sessionToken instanceof String)))
        return res.status(400).statusText('sessionToken string required').send('Attach sessionToken as a string inside the session object or into the body of the request.')
    var session = UserSessions.getSession({sessionToken})
    if(!session) 
        return res.status(422).statusText('Invalid sessionToken').send('The input sessionToken is not associated with any of the valid user sessions. Please verify the sessionToken for any typo.')
    if(!cloudSession || !(cloudSession instanceof Object))
        return res.status(400).statusText('cloudSession object field required').send('Attach the cloudSession object to the request body')
    var saved = UserSessions.saveCloudSession({ session , cloudSession })
    if(!saved) return res.status(422).statusText('Invalid data in the request').send('Please verify the data.')
    res.send('Session saved successfully')
})

router.post('/loadCloudSession',protectedRoute,async(req,res) => {
    var { email, sessionToken , session } = req.body
    if(!email || (typeof email !== 'string' && !(email instanceof String))) {
        var userSession = UserSessions.getSession({email,sessionToken,session})
        if(!userSession) return res.status(400).statusText('Invalid email')
        email = userSession.userInfo.email
    }     
    var cloudSession = UserSessions.loadCloudSession({email,sessionToken})
    if(!cloudSession) return res.status(200).statusText('No cloud sessions').send('Please save sessions in cloud before loading.')
    res.send({cloudSession})
})

router.get(["/","/getById"], requestHandler.getById)

module.exports = router
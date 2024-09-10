const express = require("express")
const router = express.Router();
const { maindb , executeTransaction , collections } = require('../db/mongo');
const { protectedRoute , requestHandler } = require("./middlewares")
const queryString = require('node:querystring'); 
const request = require('../common/https_requests')
const { UserSessions } = require('../common/session')

router.post("/filter", requestHandler.filter)

router.post("/update", protectedRoute, requestHandler.update)

router.post("/search", requestHandler.search)

router.get("/login", async (req,res) => {
    authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    authorizationUri = authorizationUrl + "?"
    redirectUri = process.env.GOOGLE_OAUTH2_REDIRECT_URI
    if(!redirectUri) redirectUri = 'https://localhost:3000/user/sso/oauth2/google'
    uriParameters = queryString.stringify({
        redirect_uri: redirectUri ,
        client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID ,
        response_type: "id_token token",
        scope: "openid",
        nonce: 'n-0S6_WzA2Mj',
        display: 'popup'
    })
    authorizationUri += uriParameters
    console.log(authorizationUri)
    return res.redirect( 302 , authorizationUri ) 
})

router.post("/getUserInfo", async(req,res) => {
    const { accessToken , idToken , _id, name , user } = req.body
    if(accessToken !== undefined) 
        return res.redirect(307,req.baseUrl+"/getGoogleOauth2Claims")
    if(_id !== undefined || name !== undefined || user !== undefined)
        return {}
})

router.post("/getGoogleOauth2Claims", async(req,res) => {
    const { accessToken , idToken , editing = {cloud:{},local:{}} } = req.body

    // baseUrl will be of the form api/newEntitys/... , api/users... etc...
    const resourceType = req.baseUrl.split('/')[1]
    const collectionName = resourceType+'s'
    
    if(accessToken === undefined) {
        return res.status(422).send({ reason: 'accessToken body field required' })
    }
    
    if( typeof accessToken !== 'string' && !( accessToken instanceof String )) {
        res.statusMessage = 'accessToken field must be a string'
        return res.status(400).send({ reason: 'accessToken field must be a string' })
    }

    var userInfoEndpoint = "https://www.googleapis.com/oauth2/v1/userinfo"
    //userInfoEndpoint = "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses"
    queryParams = queryString.stringify({ alt:'json' , access_token: accessToken })
    try {
        var claims = await request.get(
            userInfoEndpoint + '?' + queryParams,
        );  
    }
    catch ( error ) {
        return res.sendStatus(500,"Unexpected error in accessing userInfo from identity provider")
    }
    if( !claims.email || ( typeof claims.email !== 'string' || claims.email.length === 0 ) ) {
        return res.status(500).send({ reason: 'Identity provider error' })
    }
    var newSession = {
        ...req.body.session, accessToken, idToken, userInfo: claims, editing
    }
    req.body = {...req.body , session:newSession, respond:false}

    session = UserSessions.createSession(newSession)
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
    saved = UserSessions.saveCloudSession({ session , cloudSession })
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
    cloudSession = UserSessions.loadCloudSession({email,sessionToken})
    if(!cloudSession) return res.status(200).statusText('No cloud sessions').send('Please save sessions in cloud before loading.')
    res.send({cloudSession})
})

router.get(["/","/getById"], requestHandler.getById)

module.exports = router
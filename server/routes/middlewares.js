const { maindb, executeTransaction, ObjectId } = require('../db/mongo');
const { UserSessions } = require("../common/session")
const {createPrivateKey} = require('crypto') 
const crypto = require('crypto')
const request = require('../common/https_requests')
const Secrets = require('../common/secrets')

//  Decryypts client hello using private key during TLS handshake
function privateDecrypt(req,res) {
    const keyString = 
        (process.env.HOST_ENV === 'azure')
        ?
            //  Will be replaced with secret from Azure key vault
            JSON.parse(process.env.RSA_PRIVATE_KEY).value
        :
            //  .pem file content can be encoded to inline string
            //      using JSON.stringify() to handle CRLF
            JSON.parse(process.env.RSA_PRIVATE_KEY).value
    const key = createPrivateKey(   keyString   )
    var decryptedPayload = 
        crypto.privateDecrypt(
            {key,padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},
            Buffer.from(req.body.payload,'base64'))
    var aesKey = decryptedPayload.toString()
    //  Generating sessionId
    var sessionId = crypto.randomBytes(8).toString('hex')
    UserSessions.setAesKey({ [sessionId] : aesKey })
    res.sessionId = sessionId
}

// Generates a random string
function generateKey(size=32,domain) {
    var key = ''
    const base64Domain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    if(!domain) domain = base64Domain
    for (var i=0;i<size;i+=1)  
        key += base64Domain.charAt(Math.floor(Math.random() * base64Domain.length));
    return key
}

//  Encrypts outgoing packets using symmetric key
function symmetricEncrypt(req={body:{sessionId:'asda'}},res,resData={}) {
    var sessionId = req.body.sessionId? req.body.sessionId :res.sessionId
    if(!sessionId) return
    var key = UserSessions.getAesKey(sessionId)
    if(key === undefined) return resData
    var iv = generateKey(16)
    
    console.log('reqId =',reqId,'exiting resData :',resData)
    //  AES-256-GCM is used for symmetric encryption
    const cipher = crypto.createCipheriv('aes-256-gcm',  key, iv);
    var encryptedPayload = cipher.update(JSON.stringify(resData), 'utf8', 'base64');
    encryptedPayload += cipher.final('base64');
    const authTag = cipher.getAuthTag()
    
    //  Response data containing encrypted payload
    resData = {
        encryption: 'symmetric',
        payload: encryptedPayload,
        iv: iv.toString('utf8'),
        authTag: authTag.toString('base64'),
        sessionId
    }
    console.log('exiting resData :',resData)
    return resData
}

//  Decrypts incoming packets using symmetric key
function symmetricDecrypt(req,res) {
    const { payload, sessionId, iv, authTag } = req.body
    if(sessionId === undefined) {
        res.status(400).statusText('sessionId field required').send('Session ID value in request.body cannot be undefined for symmetric encryption')
    }
    const key = UserSessions.getAesKey(sessionId)
    if(key === undefined) {
        res.status(419).statusText('Session Expired.').send('The TLS session has expired. Please restart the TLS handshake in order to continue using symmetric encryption.')
        return true
    }
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag,'base64')
    var decryptedPayload = decipher.update(payload, 'base64');
    decryptedPayload += decipher.final();
    
    //  Firewall at entry gateway replaces the
    //      body of the Request object with the decrypted payload
    req.body = JSON.parse(decryptedPayload)
    res.sessionId = sessionId
    req.body.sessionId = sessionId
    return
}

//  Identifies the method of encryption and uses corresponding decryption method
function decryptPayload(req,res,next) {
    switch(req.body.encryption) {
        case undefined:
            break
        case 'public':
            var responded = privateDecrypt(req,res)
            break
        case 'symmetric':
            var responded = symmetricDecrypt(req,res)
            break
        default:
            return res.status(422).statusText('Unknown encryption')
                .send('The specified encryption is not supported.\n'+
                    'Supported encryptions: \'public\' or \'symmetric\'.'
                )
    } 
    if(!responded)
        return next()
}

//  Encrypts outgoing packets using symmetric key
function encryptPayload(req,res,resData) {
    return symmetricEncrypt(req,res,resData)
}

const rsa = { encryptPayload , decryptPayload }

//  Customizes the req and response objects during packet entry
function global(req,res,next) {
    
    //  Custom function to set status code, and status message 
    //      while sending response
    res.sendStatus = function (statusCode,statusText) {
        this.statusMessage = statusText
        return this.status(statusCode).send()
    }
    var temp = res.send

    //  Customize res.send to encrypt the exit packets
    res.send = function (data) {
        if(data === undefined) data = this.data

        //  Firewall at exit gateway encrypts the payloads
        var resData = rsa.encryptPayload(req,res,data)
        
        temp.call(this,JSON.stringify(resData))    
    }

    res.set({
        //  Setting CORS policy
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'*',
        'Access-Control-Allow-Methods':'*',
        'Access-Control-Expose-Headers':'*',
        'Access-Control-Max-Age':'7200',
        'Access-Control-Allow-Credentials':true,
        'Timing-Allow-Origin':'*',
        /*
          Client Hints provide information about
            client's device, agent, and connection
        */    
        'Accept-CH': 
            'Sec-*'
            +', Sec-CH-UA, Sec-CH-UA-*'
            +', Sec-CH-Prefers-*'
            +', Attribution-*'
            +', Device-Memory'
            +', Save-Data, Downlink, ECT, RTT'
    })

    next()
}

//  Attaches authorization token to the request body during packet entry
function isAuthenticated(req,res,next) {

    //  To respond with with "authorization required" error
    const requestAuthentication = (message) => {
        res.set({
            'WWWW-authenticate':'Bearer realm:"Access to the data manipulation features and session management"'
        })
        return res.status(401).send(message?message:"Please provide authorization credentials.")
    }
    req.authenticated = false

    //  Retrieving session token from the request body
    var { session: reqSession, sessionToken } = req.body
    if(!sessionToken) { 
        if(reqSession) sessionToken = reqSession.sessionToken
    }
    if(!sessionToken) {

        // Checking authorization header for sessionToken
        const authorization = req.get("Authorization")
        if(authorization instanceof String) {
            if(authorization.split()[0] in ['Bearer','bearer']) {
                sessionToken = authorization.split()[1]
            }
        }
    }
    if((typeof 'str' === typeof sessionToken) || (sessionToken instanceof String)) {
        req.sessionToken = sessionToken
        var session = UserSessions.getSession({ sessionToken })
        req.session = 'expired'
    } 
    if(session && session instanceof Object) {
        req.authenticated=true
        req.session = session
    }
    req.requestAuthentication = requestAuthentication
    next()
}

const configureResponse = { global }

//  Firewall prevents requests from unauthorized access on protected resources
const protectedRoute = async(req,res,next) => {
    if(req.authenticated) return next()
    return req.requestAuthentication('The requested resource is protectedRoute. '+
        'Please login in order to access the protectedRoute resource. '+
        (req.session === 'expired')?'Your session has expired.':"")
}

//  Exchanges OIDC authCode with idToken

//  Official OpenID Connect specification
//      https://openid.net/specs/openid-connect-core-1_0.html

const exchangeAuthCode = async ( { authorizationCode , reqIp, accessToken, codeVerifier } ) => {
    const tokenEndpoint = "https://oauth2.googleapis.com/token"

    if(process.env.HOST_ENV === 'azure') 
        var redirectUri = process.env.HOST_URL
    else var redirectUri = process.env.GOOGLE_OAUTH2_REDIRECT_URI
    if(!redirectUri) redirectUri = 'https://localhost:443'
    
    if(authorizationCode) {
        var tokenBody = { 
            client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID ,
            client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET ,
            code: authorizationCode,    //  the authCode submitted by the client
            //  code verifier is used for PKCE flow
            code_verifier: Secrets.data.codeVerifiers[reqIp],    
            grant_type: 'authorization_code',   //  specifies the flow as 'Authorization Flow'
            redirect_uri: redirectUri
        }
        
        try {
            var tokens = await request.post({
                uri: tokenEndpoint , body: tokenBody
            });  
        }
        catch ( error ) {
            console.log("Unexpected error while accessing tokens from identity provider")
            console.log(error)
            throw error
        }
        accessToken = tokens.access_token
    }
    
    //  Parsing ID Token to get OIDC user claims (user info)
    var splitIdToken = tokens.id_token.split('.')
    //  ID Token is a JSON Web Token ( JWT )
    //  A JWT contains header, payload and signature in base64 encoded format delimited by '.'
    const JWT = { 
        header: JSON.parse(Buffer.from(splitIdToken[0],'base64').toString('ascii')),
        payload: JSON.parse(Buffer.from(splitIdToken[1],'base64').toString('ascii'))
    }
    const claims = JWT.payload

    if(Secrets.data.nonces[claims.nonce] !== reqIp) {
        console.log('nonce not matching for',claims)
        throw('none error')
    }
    
    if( !claims.email || ( typeof claims.email !== 'string' || claims.email.length === 0 ) ) {
        throw   { reason: 'Identity provider error' }
    }
    return claims
}
var reqId = 1
const logRequest = async (req,res,next) => {
    req.reqId = reqId++
    console.log(
        'Request recieved =>', 'reqId :',req.reqId,'ip:', req.ip, ' , origin:', req.origin,
        ' , method:',req.method, ' , url:', req.originalUrl,
        ' , body:',(req.originalUrl).indexOf('tlshandshake')?req.body:''
      );
      //console.log(req)
    next()
    const entry = {
        type:   'request' ,
        ip: req.ip  ,
        method: req.method  ,
        host:   req.hostname ,
        originalUri:    req.originalUri ,
        headers:    req.headers ,
    }
}

const filter = async (req,res,next) => {
    const { filterQuery } = req.body

    // baseUrl will be of the form api/article/... , api/user/... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'

    //  Responding with 4XX status codes if required
    if(filterQuery === undefined) {
        return res.status(422).send({ reason: 'filterQuery body field required' })
    }
    if( !( filterQuery instanceof Object ) ) {
        return res.status(400).send({ reason: 'filterQuery field must be an Object' })
    } 
    
    filterQuery = { $match: filterQuery }
    
    //  Executing MongoDB match stage to perform the filter operation
    const results = await executeTransaction( async () => {
        await collections[collectionName].aggregate([
            filterQuery
        ])
    }, res)

    if(!results) return

    if(!results.length) res.status(404);

    res.send({ [collectionName]: results })

    if(next) next(results)

    return results
}

const update = async (req,res,next) => {
    
    if(!req.authenticated) {
        return req.requestAuthentication('Update requests require authentication.')
    }

    // baseUrl will be of the form api/article/... , api/user/... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'

    const { [resourceType]: resource, upsert=false , respond=true } = req.body
    const newEntity = resource?resource:req.body.newEntity
    if(newEntity === undefined) {
        return res.status(400).send({ reason: resourceType+' body field required' })
    }
    if(!( newEntity instanceof Object )) {
        return res.status(400).send({ reason: resourceType+' field must be an object' })
    }
    if(newEntity._id && !ObjectId.isValid(newEntity._id))
        return res.status(422).send({ reason: 'The value of _id field in the req.body is not a valid _id.' })
    var result = {}
    
    try{
        switch(resourceType) {
            case 'user':
                //  upserting user info into the database
                result = await executeTransaction( async () => {
                    const result = await maindb.collection(collectionName).updateOne(
                        { email: newEntity.email },
                        { $set: newEntity } ,
                        { upsert: true }
                    )
                    return result
                }, res)
                break
            case 'article':
                if( !(newEntity.author instanceof Object) ) {
                    return res.status(422).send('"author" field is required in the article document')
                }
                result = await executeTransaction( async () => {
                    var result
                    if (newEntity._id) {
                        //  Updating if _id field is provided
                        var setFields = { ...newEntity }
                        delete setFields._id
                        //  MongoDB Aggregation pipeline to update articles
                        result = await maindb.collection(collectionName).updateOne(
                            //  Match stage
                            { 
                                'author.email': newEntity.author.email  ,
                                _id: ObjectId.createFromHexString(newEntity._id)
                            },
                            //  Updating matched documerns
                            { 
                                $set: setFields ,
                                $currentDate: { lastModifiedAt: { $type: 'timestamp' } }
                            } ,
                            //  Adding comment to the MongoDB opLog entry
                            {
                                comment: 'Updating the '+resourceType+' with _id '+newEntity._id+' of '+newEntity.author.email
                            }
                        )
                    }
                    else {
                        //  Inserting if _id field is not provided
                        result = await maindb.collection(collectionName).insertOne(
                            newEntity
                            ,
                            { comment: 'Inserting '+resourceType+' of '+newEntity.author.email }
                        )
                    }
                    return result
                }, res)
                break
            default:
        }
    }
    catch(error) {
        if(!respond) { if(next) return next(error); return error}
        if(error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0]
            return res.status(409).statusText(duplicateField+' already exists').send(
                'The specified '+duplicateField+' already exists. Please try another unique '+duplicateField
            )
        }
    }
    if(result === false) return
    if(!(result.acknowledged && ( result.upsertedCount || result.matchedCount )))
        console.log('error in',resourceType,'update\n',newEntity,"\n",result)
    if(respond)
        res.send({result})
    if(next) next(result)
    return result
}

const search = async (req,res,next) => {
    const { searchSpecs , respond=true } = req.body
    console.log(req.body)
    // baseUrl will be of the form api/newEntitys/... , api/users/... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'

    //  Responding with 4XX status codes if required
    if(searchSpecs === undefined) {
        return res.status(400).send({ reason: 'searchSpecs body field required' })
    }
    if(!( searchSpecs instanceof Object )) {
        return res.status(400).send({ reason: 'searchSpecs field must be an object' })
    }

    if( searchSpecs['$search'] === undefined ) 
        var searchStage = { $search: searchSpecs }
    else
        var searchStage = { $search: searchSpecs.$search }
    
    //  Fetching the search results    
    const results = await executeTransaction( async () => {
        const searchResults = maindb.collection(collectionName).aggregate([
            searchStage
        ])
        return searchResults
    }, res)
    
    var searchResults = []
    
    for await (const result of results) {
        searchResults.push(result)
    }
    
    if(respond) {
        if( !searchResults.length ) res.status(200)
        res.send({ searchResults })
    }
    if(next) next(results)
    return results
}

const getById = async (req,res,next) => {
    
    // baseUrl will be of the form api/newEntitys/... , api/users/... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'
    var { respond=true } = req.body

    var entityId = [req.body.entityId,req.body.articleId,req.body.id,req.params.id].find(
        (id) => (id!==undefined)
    )
    
    //  Responding with 4XX status codes if required
    if(entityId === undefined) {
        return res.status(400).send({ reason: 'Id parameter required' })
    }
    if(typeof entityId !== 'string') {
        return res.status(400).send({ reason: 'Id must be a string' })
    } 
    
    if(!ObjectId.isValid(entityId))
        return res.status(422).send({ reason: 'The value of the Id field in the req.body is not a valid _id.' })
    
    //  Fetching the document by _id field
    const results = await executeTransaction( async () => {
        return maindb.collection(collectionName).aggregate([
            {
                $match: { _id: ObjectId.createFromHexString(entityId) }
            }
        ]);
    }, res)

    var resource 
    for await (const result of results) {
        resource = result
    }
    if(respond) {
        if(resource === undefined) {
            res.send(resourceType+" with the specified Id doesn't exist.")
        }
        else res.send({ [resourceType]: resource })
    }
    if(next) next(resource)
    return resource
}

const requestHandler = {
    filter, update, search, getById
}

module.exports = { generateKey, exchangeAuthCode, logRequest, rsa, isAuthenticated, protectedRoute, configureResponse , requestHandler }
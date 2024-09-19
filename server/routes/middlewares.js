const { maindb, executeTransaction, ObjectId } = require('../db/mongo');
const { UserSessions } = require("../common/session")
const {createPrivateKey} = require('crypto') 
const crypto = require('crypto')
const path = require('node:path'); 
const fs = require('fs');
const request = require('../common/https_requests')

function privateDecrypt(req,res) {
    const keyString = 
        (process.env.HOST_ENV === 'azure')
        ?
            process.env.RSA_PRIVATE_KEY
        :
            fs.readFileSync(path.normalize(
                `${__dirname}/../ssl/https/key.pem`
            ))
    const key = createPrivateKey(   keyString   )
    var decryptedPayload = 
        crypto.privateDecrypt(
        {key,padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},
        Buffer.from(req.body.payload,'base64'))
    var aesKey = decryptedPayload.toString()
    var sessionId = crypto.randomBytes(8).toString('hex')
    UserSessions.setAesKey({ [sessionId] : aesKey })
    res.sessionId = sessionId
}

function generateKey(size=32,domain) {
    var key = ''
    const base64Domain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    if(!domain) domain = base64Domain
    for (var i=0;i<size;i+=1)  
        key += base64Domain.charAt(Math.floor(Math.random() * base64Domain.length));
    return key
}

function symmetricEncrypt(req={body:{sessionId:'asda'}},res,resData={}) {
    var sessionId = req.body.sessionId? req.body.sessionId :res.sessionId
    if(!sessionId) return
    var key = UserSessions.getAesKey(sessionId)
    if(key === undefined) return resData
    var iv = generateKey(16)
    const cipher = crypto.createCipheriv('aes-256-gcm',  key, iv);
    var encryptedPayload = cipher.update(JSON.stringify(resData), 'utf8', 'base64');
    encryptedPayload += cipher.final('base64');
    const authTag = cipher.getAuthTag()
    
    resData = {
        encryption: 'symmetric',
        payload: encryptedPayload,
        iv: iv.toString('utf8'),
        authTag: authTag.toString('base64'),
        sessionId
    }
    return resData
}

function symmetricDecrypt(req,res) {
    const { payload, sessionId, iv, authTag } = req.body
    if(sessionId === undefined) return
    const key = UserSessions.getAesKey(sessionId)
    if(key === undefined) {
        res.status(419).statusText('Session Expired.').send('The TLS session has expired. Please restart the TLS handshake in order to continue using symmetric encryption.')
        return true
    }
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag,'base64')
    var decryptedPayload = decipher.update(payload, 'base64');
    decryptedPayload += decipher.final();
    req.body = JSON.parse(decryptedPayload)
    res.sessionId = sessionId
    req.body.sessionId = sessionId
    return
}

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

function encryptPayload(req,res,resData) {
    return symmetricEncrypt(req,res,resData)
}

const rsa = { encryptPayload , decryptPayload }

function global(req,res,next) {
    
    res.set({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'*',
        'Access-Control-Allow-Methods':'*',
        'Access-Control-Expose-Headers':'*',
        'Access-Control-Max-Age':'7200',
        'Access-Control-Allow-Credentials':true,
    })

    next()
}

function credentialized() {

    res.set({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'*',
        'Access-Control-Allow-Methods':'*',
        'Access-Control-Expose-Headers':'*',
        'Access-Control-Max-Age':'7200',
        'Access-Control-Allow-Credentials':true
    })

    next()
}

function isAuthenticated(req,res,next) {
    const requestAuthentication = (message) => {
        res.set({
            'WWWW-authenticate':'Bearer realm:"Access to the data manipulation features and session management"'
        })
        return res.status(401).send(message?message:"Please provide authorization credentials.")
    }
    req.authenticated = false
    var { session: reqSession, sessionToken } = req.body
    if(!sessionToken) { 
        if(reqSession) sessionToken = reqSession.sessionToken
    }
    if(!sessionToken) {
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

const configureResponse = {
    global , credentialized
}

const protectedRoute = async(req,res,next) => {
    if(req.authenticated) return next()
    return req.requestAuthentication('The requested resource is protectedRoute. '+
        'Please login in order to access the protectedRoute resource. '+
        (req.session === 'expired')?'Your session has expired.':"")
}

const exchangeAuthCode = async ( { authorizationCode , accessToken,codeVerifier } ) => {
    
    const tokenEndpoint = "https://oauth2.googleapis.com/token"

    if(authorizationCode) {
        var tokenBody = { 
            client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID ,
            client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET ,
            code: authorizationCode,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_OAUTH2_REDIRECT_URI
        }
        try {
            var tokens = await request.post({
                uri: tokenEndpoint , body: tokenBody
            });  
        }
        catch ( error ) {
            console.log("Unexpected error while accessing tokens from identity provider")
            throw error
        }
        accessToken = tokens.access_token
    }
    
    var splitIdToken = tokens.id_token.split('.')
    const JWT = { 
        header: JSON.parse(Buffer.from(splitIdToken[0],'base64').toString('ascii')),
        payload: JSON.parse(Buffer.from(splitIdToken[1],'base64').toString('ascii'))
    }
    const claims = JWT.payload
    if( !claims.email || ( typeof claims.email !== 'string' || claims.email.length === 0 ) ) {
        throw   { reason: 'Identity provider error' }
    }

    return claims
}

const filter = async (req,res,next) => {
    const { filterQuery } = req.body

    // baseUrl will be of the form api/newEntitys/... , api/users... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'

    if(filterQuery === undefined) {
        return res.status(422).send({ reason: 'filterQuery body field required' })
    }
    if( !( filterQuery instanceof Object ) ) {
        return res.status(400).send({ reason: 'filterQuery field must be an Object' })
    } 

    filterQuery = { $match: filterQuery }
    
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

    // baseUrl will be of the form api/article/... , api/user... etc...
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
    //newEntity._id = new ObjectId(newEntity._id)
    var result = {}
    try{
    switch(resourceType) {
        case 'user':
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
                    var setFields = { ...newEntity }
                    delete setFields._id
                    result = await maindb.collection(collectionName).updateOne(
                        { 
                            'author.email': newEntity.author.email  ,
                            _id: ObjectId.createFromHexString(newEntity._id)
                        },
                        { 
                            $set: setFields ,
                            $currentDate: { lastModifiedAt: { $type: 'timestamp' } }
                        } ,
                        {
                            comment: 'Updating the '+resourceType+' with _id '+newEntity._id+' of '+newEntity.author.email
                        }
                    )
                }
                else {
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

    // baseUrl will be of the form api/newEntitys/... , api/users... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'

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
    // baseUrl will be of the form api/newEntitys/... , api/users... etc...
    const resourceType = req.baseUrl.split('/')[2]
    const collectionName = resourceType+'s'
    var { respond=true } = req.body

    var entityId = [req.body.entityId,req.body.articleId,req.body.id,req.params.id].find(
        (id) => (id!==undefined)
    )
    
    if(entityId === undefined) {
        return res.status(400).send({ reason: 'Id parameter required' })
    }
    if(typeof entityId !== 'string') {
        return res.status(400).send({ reason: 'Id must be a string' })
    } 
    
    if(!ObjectId.isValid(entityId))
        return res.status(422).send({ reason: 'The value of the Id field in the req.body is not a valid _id.' })
    
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

module.exports = { generateKey, exchangeAuthCode, rsa, isAuthenticated, protectedRoute, configureResponse , requestHandler }
import request from "./request"
import { AES } from "./cryptograph"
import TLS from "./TLS";
//require('dotenv').config()
//import dotenv from "dotenv"
//dotenv.config()
var serverUrl =    process.env.REACT_SERVER_URL
//if(!serverUrl) serverUrl = 'https://localhost:443'
if(!serverUrl) serverUrl = 'http://localhost:3000'
const apiUri = serverUrl+"/api"

const methodConfig = {

    post: ({resourceType, operation, body}) => {
        return {
            method: "post",
            uri: apiUri+"/"+resourceType+"/"+operation,
            body
        }
    },

    get: (options) => {
        const {resourceType, ids, sourceUri, operation} = options
        const uri = ((sourceUri)?sourceUri:(apiUri+"/"+resourceType+"/"+operation+"/")) 
        return { method:'post', uri }
        if(ids !== undefined && typeof ids == "string")
            return {
                method: "get",
                uri: uri+"/:"+ids
            }
        if(options.method !== undefined)
            return {
                method: options.method,
                uri: uri
            }
        return methodConfig.post( options )
    },
    origin: (options) => {
        return {
            method: 'origin'
        }
    }

}


async function accessAPI(options) {  
    const session = options.session
    console.log('Initiating request\noptions :\n',options)
    const originalBody = { ...options.body }
    if( ! ( options.method in ['OPTIONS','GET'] ) )
        if(options.body && options.body instanceof Object) {
            if(!session.aes) 
                try { 
                    console.log('Intitiating tls handshake\n');
                    await TLS.handshake(options) }
                catch(error) { 
                    console.log('error during tls handshake\n',error)
                    options.setNotification({
                        type:'error',
                        message:'Error during TLS handshake',
                        details: error
                    })
                    return
                }
            console.log('Intitiating symmetric encryption of body :\n',options.body)
            const { ciphertext, authTag, iv } = await AES.encrypt({
                secret:options.body,
                key: session.aes.key
            })
           options.body = { 
                encryption: 'symmetric', 
                sessionId: session.sessionId ,
                payload: ciphertext, iv ,  
                authTag
            }
            console.log('Body after symmetric encryption :\n',options.body)
        }
    try {
        console.log('Intitiating fetch request')
        var response = await request[options.method](options)    
    }
    catch (error) {
        console.log('Error during fetch request\n',error)
        if(error.code === 'ERR_NETWORK') {
            options.setNotification({type:'error',message:'Network Error'})
            return undefined
        }
        if(error.response.status === 419) {
            delete session.aes
            delete session.sessionId
            options.body = originalBody
            return accessAPI(options)
        }
        var response = error.response
    }
    console.log('Initiating symmetric decryption of fetch request :\n',response)
    response.data = await AES.decrypt({
        ...response.data, 
        ciphertext: response.data.payload,
        key: session.aes.key
    })

    return response
}

export {methodConfig,accessAPI};
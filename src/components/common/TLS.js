import request from "./request"
import { AES , publicEncrypt } from "./cryptograph"
var serverUrl =    process.env.REACT_SERVER_URL
//if(!serverUrl) serverUrl = "https://localhost:443"
if(!serverUrl) serverUrl = "http://localhost:3000"
const apiUri = serverUrl+"/api"

class TLS {
    static status = undefined
    static async handshake(options) {
        const session = options.session
        if(this.status !== undefined && this.status!=='error') {
            session.aes = this.status
            return
        }
        var resolver,rejecter
        this.status = new Promise((resolve,reject) => { resolver=resolve; rejecter=reject })
        var key = AES.generateKey()
        console.log('aesKey.length ='+key.length,'\naesKey =',key)
        var clientHello = {
            method: 'post',
            uri: serverUrl+'/api/tlshandshake',
            body : { encryption: 'public', 
                payload : await publicEncrypt({
                    secret: key
                }) 
            }
        }
        try {
            console.log('Initiating clientHello\nclientHello :',clientHello)
            var serverHello = await request['post'](clientHello)    
        }
        catch (error) {
            rejecter('error')
            console.log('error during clientHello\n',error)
            throw(error)
        }
        console.log('serverHello :',serverHello)
        session.aes = { key }
        session.sessionId = serverHello.data.sessionId
        console.log('after setting sessionId in session :\n',session)
        var data = await AES.decrypt({ 
            ciphertext:serverHello.data.payload,
            iv:serverHello.data.iv,
            authTag: serverHello.data.authTag,
            key: session.aes.key,
        })
        console.log('serverHello.data after decryption :\n',await data)
        resolver(session.aes)
        return 
    }
}

export default TLS
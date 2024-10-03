import request from "./request"
import { AES , publicEncrypt } from "./cryptograph"
import InMemoryStore from "./InMemoryStore"

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
        console.log(InMemoryStore.store.cache.env.REACT_API_URL+'tlshandshake')
        console.log(InMemoryStore.store)
        var clientHello = {
            method: 'post',
            uri: InMemoryStore.store.cache.env.REACT_API_URL+'tlshandshake',
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
        console.log('serverHello.data :',serverHello.data)
        session.aes = { key }
        session.sessionId = serverHello.data.sessionId
        var data = await AES.decrypt({ 
            ciphertext:serverHello.data.payload,
            iv:serverHello.data.iv,
            authTag: serverHello.data.authTag,
            key: session.aes.key,
        })
        console.log('serverHello.decryptedData :',data)
        resolver(session.aes)
        return 
    }
}

export default TLS
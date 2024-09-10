var RSA_PUBLIC_KEY=process.env.RSA_PUBLIC_KEY
if(!RSA_PUBLIC_KEY) 
    RSA_PUBLIC_KEY='MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4EkjwJnkK/6XYMT5MpVufioLMDZhVDd3ekX8N2ZdgxfCZcVwdDAJCUJGhhYNYYj+Y1yz5iEqTQ10r/5MT9bKQE4osqtkIFqi9hFaFZmakLFZbaTNCPrHK0STC2EVg21ZmGEPRX+dM9mCPq1dOrEg4JjsB7NuGzrtM4FnSs6y7yZ3VpWRYDVLkPbY5v4LYxCopE2ojJUP2CUUDjyAqzj1S+J4J6rxqe5C2KDCdbUr2avdP4+25osBAo2KGN6YCJIvgMC1MpQkyAEf3mPmBRJtH2SDsZlou9MBdDTsfudX+jmAtpeiTBeDNCWQdNdAV6y7XocGDgKdOPlP/VcHV8LkkwIDAQAB'

function strToBuffer(str) {
    var buffer = new Uint8Array( new ArrayBuffer(str.length) )
    for(var i=0;i<str.length;i++) 
        buffer[i] = str.charCodeAt(i)
    return buffer
}

function base64ToBuffer(b64Str) {
    var str = window.atob(b64Str)
    return strToBuffer(str)
}

function bufferToBase64(buffer) {
    var bufferArray = new Uint8Array(buffer)
    var binary = ''
    for(var i=0;i<bufferArray.length;i++)
        binary += String.fromCharCode(bufferArray[i])
    var b64Str = window.btoa(binary)
    return b64Str
}

async function publicEncrypt({ secret }) {
    var publicKey = await window.crypto.subtle.importKey(
        'spki',base64ToBuffer(RSA_PUBLIC_KEY),
        {name:'RSA-OAEP',hash:'SHA-256'},true,['encrypt']
    )
    var encrypted = await window.crypto.subtle.encrypt(
        {name:'RSA-OAEP',hash:'SHA-256'},
        publicKey,
        strToBuffer(secret))
    var encryptedBase64 = bufferToBase64(encrypted)
    return encryptedBase64
};

const aes = {}

class AES {

    static generateKey(size=32) {
        var key = ''
        const base64Domain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        for (var i=0;i<size;i+=1)  
            key += base64Domain.charAt(Math.floor(Math.random() * base64Domain.length));
        return key
    }

    static async importKey(key=this.generateKey()) {
        return await crypto.subtle.importKey(
            "raw",
            strToBuffer(key),
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    static async encrypt({ secret , iv = this.generateKey(16) , key }) {
        //console.log('Initiating aes.encrypt','secret :',secret,'iv :',iv,'session :',session)
        secret = JSON.stringify(secret)
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: strToBuffer(iv),
                tagLength : 128
            },
            await this.importKey(key),
            strToBuffer(secret)
        );
        
        //console.log("aes.encrypt completed \ncipherText :",ciphertext,bufferToBase64(ciphertext),
        //   "authTag :", bufferToBase64(base64ToBuffer(bufferToBase64(ciphertext))),'iv :',iv)
        return {
            ciphertext: bufferToBase64(ciphertext.slice(0, ciphertext.byteLength - 16)),
            authTag: bufferToBase64(ciphertext.slice(ciphertext.byteLength - 16)),
            iv,
        };
    };

    static async decrypt({ ciphertext, iv, authTag, key }) {
        key = await this.importKey(key);
        ciphertext = window.atob(ciphertext)+window.atob(authTag)
        ciphertext = window.btoa(ciphertext)
        const cleartext = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: strToBuffer(iv),
                tagLength: 128
            },
            key,
            base64ToBuffer(ciphertext)
        );

        const secret = new TextDecoder().decode(cleartext);
        
        //console.log("aes.decrypt completed \nsecret :",secret,bufferToBase64(cleartext),'iv :',iv)
        return JSON.parse(secret);
    };

}

async function testAes() {
    var key = '8Q3I3C6fQPed1oirIzQvyZSnxETLRhnD'
    var iv = 'VYvSHLrT5q6oSlHQ'
    key = 'ukaAfQfdhm5STutbhD1disJvW/gv8PPG'
    iv = '1kV845MfIwnIb99B'
    //payload: '9so=',
    var session = { aes: { key } }
    var secret = JSON.stringify({})
    console.log('Initiating aes testing','secret :',secret,'key :',key,'iv :',iv,'session :',session)
    var { ciphertext, iv, authTag } = await AES.encrypt({secret,iv,session})
    console.log('ciphertext =',ciphertext)
    console.log(base64ToBuffer(ciphertext),bufferToBase64(base64ToBuffer(ciphertext)))
    var decrypted = await AES.decrypt({ciphertext,iv,authTag,session})
    console.log('decrypted =', decrypted)
}
//testAes()

export { publicEncrypt , AES }
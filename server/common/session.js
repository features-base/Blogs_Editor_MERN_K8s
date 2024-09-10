const { createHmac } = require('node:crypto');

class UserSessions {

    static sessionTokens = {}
    static userSessions = {}
    static savedSessions = {}
    static aesKeys = {}

    static createSession(session) {
        var hmac = createHmac('sha256',session.accessToken)
        hmac.update(JSON.stringify(session))
        session.sessionToken = hmac.digest().toString('hex')
        
        if(!session.editing) 
            session.editing = {local:{},cloud:{}}

        var email = session.userInfo.email
        this.userSessions[email] = session
        this.sessionTokens[session.sessionToken] = email
        return session
    }
    
    static getSession({ sessionToken , email , session }) {
        console.log('userSessions :',this.userSessions)
        console.log('sessionTokens :',this.sessionTokens)
        console.log('aesKeys :',this.aesKeys)
        if(!sessionToken && session && session instanceof Object && session.sessionToken)
            sessionToken = session.sessionToken
        if(sessionToken) {
            var email = this.sessionTokens[sessionToken]
            if(!email) return 
            return this.userSessions[email]
        }
        if(session) {
            var email = session.userInfo.email
            // Getting past session info should be done here
            return this.userSessions[email]   
        }
        if(email) {
            if(!this.userSessions[email]) 
                return
            return this.userSessions[email]
        }
    }

    static verifySession(sessionToken) {
        return this.getSession({sessionToken})
    }

    static updateSession(session) {
        var email = this.userSessions[sessionToken]
        if(!email || email!==session.userInfo.email)
            return
        this.userSessions[email] = session
        return session
    }

    static terminateSession({ sessionToken }) {
        var email = this.sessionTokens[sessionToken]
        if(!email) return
        delete this.sessionTokens[sessionToken]
        delete this.userSessions[email]
    }

    static saveCloudSession({ email , sessionToken , session , cloudSession }) {
        var userSession = this.getSession({email,sessionToken,session})
        if(!userSession) return
        var email = userSession.userInfo.email
        this.savedSessions[email] = cloudSession
        return true
    }

    static loadCloudSession({sessionToken,email,cloudSession}) {
        console.log('savedSessions :',this.savedSessions)
        if(!email) email = sessionTokens[sessionToken]
        return this.savedSessions[email]
    }

    static getAesKey(sessionId) {
        return this.aesKeys[sessionId]
    }

    static setAesKey(key) {
        this.aesKeys = { ...this.aesKeys , ...key }
    }

}

module.exports = { UserSessions }
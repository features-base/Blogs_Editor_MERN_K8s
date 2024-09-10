import { getArticle, getArticles } from '../article/loaders'
import getSession from '../browse/getSession' 
import { accessAPI, methodConfig } from './accessAPI'

async function accessResource(options) {
    var response = await accessAPI({...options,...methodConfig.get(options)})    
    return response
}

function useAPI({ session , cache , setNotification }) {

    const API = {} 
    const attachments = {
        session, cache, setNotification, API
    }
    const wrapSessionToken = (options) => {
        if(!options) options = {}
        var body = options.body
        if(!body) body = {}
        body = { ...body , sessionToken:session.sessionToken }
        return { ...options , body , ...attachments }
    }
    API.accessResource = (options) => {
        return accessResource(wrapSessionToken(options))
    }
    API.getArticles = (options) => {
        return getArticles(wrapSessionToken(options))
    } 
    API.getArticle = (options) => {
        return getArticle(wrapSessionToken(options))
    }
    API.getSession = (options) => {
        return getSession(wrapSessionToken(options))
    }
    return ( API )
}

export default useAPI
import { getArticle, getArticles } from '../article/loaders'
import getSession from '../browse/getSession' 
import { accessAPI, methodConfig } from './accessAPI'

async function accessResource(options) {
    var response = await accessAPI({...options,...methodConfig.get(options)})    
    return response
}

/*
    useApi hook returns the API object which can be used to access the 
        backend API. The API checks, and updates the caches also.
    Whenever the state variables in the props change, the hook rerenders
        to update the API object by attacing the new state variables
        to the requests sent through the API object.
*/
function useAPI({ session , setSession , setNotification }) {

    const API = {} 
    const attachments = {
        session, setNotification, API, setSession
    }

    //  Attaches the session token to the request body
    const wrapSessionToken = (options) => {
        if(!options) options = {}
        var body = options.body
        if(!body) body = {}
        body = { ...body , sessionToken:session.sessionToken }
        return { ...options , body , ...attachments }
    }
    
    async function doRequest (options,loader) {
        options = wrapSessionToken(options)
        var response = await loader(options)
        if(response.status == 401) 
            if(session.state==='loggedIn')
                setSession({ ...session, state : 'loggedOut' })
        return response
    }
    
    API.accessResource = (options) => {
        return doRequest(options,accessResource)
    }
    API.getArticles = (options) => {
        return doRequest(options,getArticles)
    } 
    API.getArticle = (options) => {
        return doRequest(options,getArticle)
    }
    API.getSession = (options) => {
        return doRequest(options,getSession)
    }
    return ( API )
}

export default useAPI
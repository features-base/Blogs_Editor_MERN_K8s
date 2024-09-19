const post = async (options) => {
    if(!options.body) options.body={}
    const config = {
        method: options.method,//'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(options.body)
    }
    if(options.method === 'get')
        delete config.body
    //throw ({name:'fetch error',message:'asdfasdf'})
    var res
    try {
        res = await fetch(options.uri,config)
    }
    catch (error) {
        throw ({code:'ERR_NETWORK',name:'Network Error'})
    }
    try {
        res.data=await res.json()
    }
    catch (error) {
        res.data = {}
    }

    if(res.status<200 || res.status>299) {
        throw { code: res.status , status:res.status, statusText: res.statusText , response: res }
    }
    return res
}

var request = {
    post: (options) => {
        return post(options)
    }
    ,
    get: (options) => {
        return post(options)
    }
}

export default request
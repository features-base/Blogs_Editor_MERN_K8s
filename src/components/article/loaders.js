import InMemoryStore from '../common/InMemoryStore';

const  cache=InMemoryStore.store.cache

async function getArticle ({articleId,API}) {
    if(articleId === undefined) {
        const location = window.location;
        const queryParams = new URLSearchParams(location);
        const articleId = queryParams.get("articleId")
        if(!articleId || articleId === "" && articleId!=="undefined")   
            return 'error'    
    }
    //  Checking im-memory cache
    if(cache && cache.articles[articleId] !== undefined && cache.articles[articleId] !== 'undefined') {
        return cache.articles[articleId]
    }
    //  Checking local storage
    var article = window.localStorage.getItem(articleId)
    if(!article || article==="" || article==="undefined") {
        article = undefined
    }
    if(article !== undefined)
        article = JSON.parse(article)
    if(!article || article === undefined || article==='undefined') {
        //  Fetching from backend API
        var res = await API.accessResource({
            resourceType: 'article',
            operation: 'getOne',
            body: { articleId }
        })
        if(res.status<200 || res.status>299)
            return 'error'
        article = res.data.article
        if(!article)
            return
    }
    //  Storing local storage and in-memory cache
    window.localStorage.setItem( articleId , JSON.stringify(article) )
    cache.articles[articleId] = article
    return article
}

//  To search through the database
async function getArticles ({searchTerm,author,session,API}) {
    if(author) 
        if(author instanceof String) author={   name:   author  }
    if(!searchTerm ||  
        ( typeof searchTerm !== 'string' && !(searchTerm instanceof String) ) )
        if(!(session && session.state==='loggedIn'))
            searchTerm = "article"
        else searchTerm = session.userInfo.name
    const searchStage = {
        'index': 'luceneSearch',
        'compound': {
            //'must': [] ,
            //'mustNot': [],
            'should': [
                {
                    'text': {
                        'path': ['title','deck','author','body'],
                        'query': searchTerm,
                        'fuzzy': {},
                        'score': { 'boost' : { 'value': 5 } }
                    } ,
                },
                {
                    'text': {
                        'path': ['deck'],
                        'query': searchTerm,
                        'fuzzy': {},
                        'score': { 'boost' : { 'value': 3 } }
                    }
                },
                {
                    'text': {
                        'path': ['author'],
                        'query': searchTerm,
                        'fuzzy': {},
                        'score': { 'boost' : { 'value': 2 } }
                    },
                },
                {
                    'text': {
                        'path': ['body'],
                        'query': searchTerm,
                        'fuzzy': {}
                    }
                },
            ] ,
            'minimumShouldMatch': 1,
            //'filter': []
        },
        'sort': { 'score': { $meta : 'searchScore' } }
    }
    if(author && author.name && author.name instanceof String)
        searchStage.compound.filter.push(
            {'text':{'path':'author.name',query:author.name}}
        )
    var searchResponse = await API.accessResource({
        resourceType: 'article',
        operation: 'search',
        body: { searchSpecs: searchStage }
    })
    if(!searchResponse) return 'error'
    if(searchResponse.status<200 || searchResponse.status>299)
        return []
    var searchResults = searchResponse.data.searchResults
    if(!searchResults) searchResults=[]
    return searchResults
}

export { getArticle , getArticles }
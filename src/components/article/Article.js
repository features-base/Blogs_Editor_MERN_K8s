import React, {useState,useReducer,useRef,useEffect,useMemo,memo,useContext} from "react";

import MenuBar from "../common/MenuBar";
import getMenuOptions from "./getMenuOptions";
import EditableDiv from "../common/EditableDiv";
import Tags from "./Tags"
import { AppContext } from "../../App"

function articleReducer(article,{ setSaved, type, ...prop}){
    if(!type) type = 'edit'
    setSaved(saved => { 
        if(type==='edit') return {...saved,cloud:false,local:false,committed:false,reset:false}
        if(type==='reset') return {...saved,cloud:false,local:false,committed:false,reset:true}
        return {...saved,[type]:true }
    })
    if(Object.keys(prop).includes('tag')) {
        var newTags = [...article.tags]
        switch(prop.tag.operation) {
            case 'update':
                newTags[prop.tag.idx] = prop.tag.value
                break
            case 'add':
                newTags.push('')
                break
            case 'delete':
                newTags = [...newTags.slice(0,prop.tag.idx),...newTags.slice(prop.tag.idx+1)]
                break
            case 'replace':
                newTags = prop.tag.newTags
        }
        prop.tags = newTags
        delete prop.tag
    }
    return ({...article,...prop})
}

const defaultValues = {   
    tags: ["Software","React","Articles"],
    //_id: "2345345",
    title: "An Article to demonstrate the React App",
    deck: "The React App can display articles along "+
      "with their metadata in a well-formatted manner",
    date: "18 July 2024",
    body:"This is the content of the article demonstrating the web app."+ 
      " This can be editable with a button."
}

function Article ({mode,articleId}) {

    //  If true, the article is in edit mode
    const [editing, setEditing] = useState(false)
    //  If true, the user is authorized to edit the articles. 
    //      Toggles the menu bar
    const [editable,setEditable] = useState(false)
    const [saved,setSaved] = useState({local:false,cloud:false,committed:(mode!=='create'),reset:true,updated:((mode!=='create')?'committed':false)})
    const [article, articleDispatch] = useReducer( (article,prop) => articleReducer(article,{...prop,setSaved}), defaultValues);
    const [isLoading, setIsLoading] = useState(true)
    const { session , API, uriPath, setNotification } = useContext(AppContext)
    //  Original fetched article. Used during reset operation.
    const articleOriginal = useRef()
    const [errors,setErrors] = useState({})

    //  Fetches the article during initial render
    async function loader() {
        var newArticle
            if(!articleId || articleId==='')
                articleId = uriPath.path[1]
            if (!articleId || articleId==='')
                return
            if(articleId[0]===':')
                articleId = articleId.slice(1)
            setIsLoading(true)
            var articleRes = await API.getArticle({articleId})
            setIsLoading(false)
            newArticle =  articleRes 
            if(session.state==='loggedIn' && session.userInfo.email === newArticle.author.email)
                setEditable(true)
            else setEditable(false)
        articleOriginal.current = { ...newArticle }
        articleDispatch(articleOriginal.current)
    }

    //  Used when authorization changes
    //  For example: Switching among different articles
    useEffect(() => { 
        if(mode === 'create') {
            var newArticle = defaultValues
            setIsLoading(false)
            setEditable(true)
            setEditing(true)
            if(session.state === 'loggedIn') 
                article.author = session.userInfo
            articleOriginal.current = { ...newArticle }
            articleDispatch(newArticle)
            return
        }
        loader()
    } , [mode] )

    // Validates and publishes the edited article 
    const submitArticle = async () => {
        var value, errorsTemp = {}

        //  Required fields cannot empty
        var requiredFields = ['title','deck']
        requiredFields.map((field,idx) => {
            value = article[field].trim()
            if(value === '') {
                errorsTemp[field] = field+' field cannot be empty'
            }
        })
        var newTags = article.tags.filter(tag => tag.trim().length)
        if(Object.keys(errorsTemp).length !== 0) {
            setErrors(errorsTemp)
            if(newTags.length !== article.tags.length)
                articleDispatch({ tags : { operation: 'replace', newTags } })
            return
        }
        delete article.cursor
        
        var response = await API.accessResource({
            resourceType: 'article',
            operation: 'update',
            body: { article }
        })
        if( response && ( response.status >= 200 && response.status <= 299 ) )
            setNotification({ type: 'success', message: 'Article has been committed' })
        else {
            setNotification({ type: 'error' , message: 'Error in committing the changes.' , details: response })
            return
        }
        if(!article._id) article._id = response.data.result.insertedId
        setSaved((saved) => { return {...saved,committed:true} })
    } 

    const articleRef = useRef();
    var menuOptions = useMemo(()=>getMenuOptions({session,editing,setEditing,article,articleDispatch,submitArticle,setNotification,API,articleOriginal,saved,setSaved}))
    const editableDivProps = { content: article , setContent: articleDispatch, saved, editable, editing, errors }

    if(isLoading)
        return(
            <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hourglass-split" viewBox="0 0 16 16">
                    <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                </svg>
                <div>Loading the Article</div>
            </>
        ) 
        
    return(
        <div className="article" ref={articleRef}>
            {
            ((editable)?
                <MenuBar options={menuOptions.article}/>
                : <></>
            )
            }   
            <div className="header">
                <div className="article-meta">
                    <Tags
                        article={article} 
                        articleDispatch={articleDispatch} 
                        editing={editing}
                    >
                    </Tags>
                </div>
                <EditableDiv
                    name="title"
                    props={editableDivProps}
                ></EditableDiv>
                <EditableDiv
                    name="deck"
                    props={editableDivProps}
                ></EditableDiv>
                <div className="more-info">
                    <div className="author">
                        { 
                            (article.author)?article.author.name: 
                            (session.state === 'loggedIn')?session.userInfo.name:
                            'Anonymous'
                        }
                    </div>
                    <div className="lastModified">
                        { 
                            article.lastModified?article.lastModified:
                            article._id?(new Date(parseInt(article._id.substring(0,8), 16)*1000)).toLocaleString():
                            (new Date()).toLocaleString() 
                        }
                    </div>
                </div>
            </div>
            <EditableDiv
                name="body"
                props={editableDivProps}
            ></EditableDiv>
        </div>
    )
}

export default Article;
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

const EditableDivMemo = memo(({name,props}) => {
    return(
        <EditableDiv
            name={name}
            props={props}
        ></EditableDiv>
    )
},({props:prevProps},{name,props:newProps}) => {
    return false
    //return true
    var prevArticle = prevProps.content,newArticle = newProps.content
    console.dir({ name , prev:prevArticle[name], new:newArticle[name]
        , saved: newProps.saved , prevArticle , newArticle
        , prevProps , newProps
     })
     return false
    if(prevProps.editing !== newProps.editing) return false
    if(prevProps.editable !== newProps.editable) return false
    if(prevProps.error !== newProps.error) return false
    if(newProps.saved.cloud || newProps.saved.local 
        || newProps.saved.committed || newProps.saved.reset) {
            console.log('returning',(prevArticle[name] !== newArticle[name]))
        if(prevArticle[name] !== newArticle[name]) return false
    }
    return true
    if (prevArticle[name] !== newArticle[name]) return false
    if(!prevArticle.cursor) {
        if(!newArticle.cursor) return true;
        return(newArticle.cursor.field !== name)
    }
    if(!newArticle.cursor) return true
    if(newArticle.cursor.field != name) return true
    if(newArticle.cursor.field !== prevArticle.cursor.field) return false
    return(prevArticle.cursor.offset === newArticle.cursor.offset)
})


const TagsMemo = memo(({article,setArticle,editing}) => {
    return (
        <Tags 
            article={article} 
            setArticle={setArticle} 
            editing={editing}
        >
        </Tags>
    )
}, ({article:oldArticle,editing:oldEditing},{article:newArticle,editing:newEditing}) => {
    //console.log(oldArticle.tags,newArticle.tags)
     return false
    return (
        oldArticle.tags.length === newArticle.tags.length
        &&
        oldEditing === newEditing)
})

function Article ({mode,articleId}) {

    const [editing, setEditing] = useState(false);
    const [editable,setEditable] = useState(false)
    const [saved,setSaved] = useState({local:false,cloud:false,committed:(mode!=='create'),reset:true,updated:((mode!=='create')?'committed':false)})
    const [article, setArticle] = useReducer( (article,prop) => articleReducer(article,{...prop,setSaved}), defaultValues);
    const [isLoading, setIsLoading] = useState(true)
    const { session , API, uriPath, setNotification } = useContext(AppContext)
    const articleOriginal = useRef()
    const [errors,setErrors] = useState({})

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
        setArticle(articleOriginal.current)
    }

    useEffect(() => { 
        if(mode === 'create') {
            var newArticle = defaultValues
            setIsLoading(false)
            setEditable(true)
            setEditing(true)
            if(session.state === 'loggedIn') 
                article.author = session.userInfo
            articleOriginal.current = { ...newArticle }
            setArticle(newArticle)
            return
        }
        loader()
    } , [mode] )

    // Validates and publishes the edited article 
    const submitArticle = async () => {
        var value, errorsTemp = {}
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
                setArticle({ tags : { operation: 'replace', newTags } })
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
    var menuOptions = useMemo(()=>getMenuOptions({session,editing,setEditing,article,setArticle,submitArticle,setNotification,API,articleOriginal,saved,setSaved}))
    const editableDivProps = { content: article , setContent: setArticle, saved, editable, editing, errors }

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
                        {
                        <TagsMemo
                            article={article} 
                            setArticle={setArticle} 
                            editing={editing}
                        >
                        </TagsMemo>
                        }
                    <div className="article-id">
                        {article.articleId}
                    </div>
                </div>
                <EditableDivMemo
                    name="title"
                    props={editableDivProps}
                ></EditableDivMemo>
                <EditableDivMemo
                    name="deck"
                    props={editableDivProps}
                ></EditableDivMemo>
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
            <EditableDivMemo
                name="body"
                props={editableDivProps}
            ></EditableDivMemo>
        </div>
    )
}

export default Article;
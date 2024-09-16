import React, {useState,useEffect,useContext} from "react";


import {getArticle} from "./loaders"
import { AppContext } from "../../App";
import ButtonCustom from "../common/ButtonCustom";

const defaultValues = {   
    tags: ["Software","React","Articles"],
    _id: "2345345",
    title: "An Article to demonstrate the React App",
    deck: "The React App can display articles along "+
      "with their metadata in a well-formatted manner",
    date: "18 July 2024",
    author: {
        name: "Not Anonymous",
    } ,
    body:"This is the content of the article demonstrating the web app."+ 
      " This can be editable with a button."
}

var buttonOptions = {
    edit: { 
        name: "edit",
        selected: false,
        hoverText: "Click to edit the article",
        handler: ()=>{},
        svg: {
            pathD:[
                "M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" 
            ]
        }
    }
}

// This renders a preview of the article to show as search results 
function ArticlePreview ({mode,articleId,...props}) {

    const [article, setArticle] = useState(props.article?props.article:defaultValues);
    const [editable, setEditable] = useState(false)
    const {session,setRoute} = useContext(AppContext)

    // Loads the article during first render
    useEffect(() => { ( async () => {
        if(article instanceof Object && article._id){
            if(session.state === 'loggedIn' && session.userInfo.email === article.author.email) {
                setEditable(true)
            }
            return
        }
        var newArticle
        if(!articleId) {
            newArticle = defaultValues
            return
        }
        var articleRes = await getArticle(articleId)
        newArticle =  articleRes 
        if(session.state === 'loggedIn' && session.userInfo.email === article.author.email) {
            setEditable(true)
        }
        setArticle(newArticle)
    } )() }, [])
    
    return (
        <div className="article preview" 
            onClick={() => { setRoute("/article/:"+article._id) }}
        >
            {
                ((editable)?
                    <ButtonCustom
                        option = {buttonOptions.edit}
                    >
                    </ButtonCustom>
                :<></>)
            }
            <div className="header">
                <div className="article-meta">
                    <div className="tags">
                    {
                        article.tags.map((tag,idx) => {
                            return  (
                                <div
                                    key = {'tag'+idx} 
                                    className='tag tag-wrapper'
                                >
                                    { tag }
                                </div>
                            )
                        })
                    }
                    </div>
                    <div className="article-id"> {article.articleId} </div>
                </div>
                <div name="title" className={"title"} >{article.title}</div>
                <div className="more-info">
                    <div className="author">{ article.author.name }</div>
                    <div className="lastModified">
                        { 
                            article.lastModified?article.lastModified:
                            article._id?(new Date(parseInt(article._id.substring(0,8), 16)*1000)).toLocaleString():
                            'error in getting date. Please contact us.'
                        }
                    </div>
                </div>
                <div name="deck" className={"deck"} >{article.deck}</div>
                
            </div>
            <div name="body" className={"body roboto-font"} >
                {((article.body.length>60)?
                    article.body.slice(0,60)+'...'
                :article.body)}
            </div>
        </div>
    )

}

export default ArticlePreview;
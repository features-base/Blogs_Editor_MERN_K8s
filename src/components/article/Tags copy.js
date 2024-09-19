import React , { useState,useEffect,memo } from 'react'

import EditableDiv from '../common/EditableDiv'

const EditableDivMemo = memo(({name,props}) => {
    return (
        <EditableDiv name={name} props={props}></EditableDiv>
    )
},({name,props:oldProps},{props:newProps})=> {
    //console.log(name,oldProps,newProps)
    //if(oldProps.content && oldProps.content.tags.length !== newProps.content.tags.length)
    //    return false
    return true
})

function Tags ({ article, setArticle, editing }) {
    const [content,setContent] = useState()
    const [contentUpdate,setContentUpdate] = useState()

    useEffect(()=>{
        var newContent = {cursor:article.cursor,tags:article.tags}
        article.tags.map((tag,idx) => {newContent['tag'+idx]=tag})
        setContent(newContent)
    },[])

    useEffect(() => {
        if(!contentUpdate) return
        var props = contentUpdate
        var name = props.cursor.field
        var idx = parseInt(name.slice(3))
        var newTags = [ ...article.tags ]
        newTags[idx] = props[name]
        var newCursor = { field: 'tags' }
        setContent({...content,tags:newTags,[name]:props[name]})
        setArticle({tags:newTags,cursor:newCursor})
    }, [contentUpdate])

    function addTag () { 
        setContent({...content,tags:[...content.tags,'']}) 
        setArticle({...article,tags:[...article.tags,'']}) 
    }
    function deleteTag (idx) { 
        var newContent = {...content,tags:[...content.tags.slice(0,idx),...content.tags.slice(idx+1)]}
        //newContent.tags.map((tag,idx) => {newContent['tag'+idx]=tag})
        setContent(newContent)
        setArticle({...article,tags:[...article.tags.slice(0,idx),...article.tags.slice(idx+1)]}) 
    }
    var tagProps = 
        {className:'tag',editing,content,setContent:setContentUpdate,tag:true}
        
    return(
        <div className={"tags "+((editing)?'editing':'')}>
            {(editing)?
                <div className="tag add unselectable"
                    onClick={addTag}    
                >+</div>
                :<></>
            }
            {   
                article.tags.map((tag,idx) => { 
                    return  (
                        ((content)?
                            <div className='tag-wrapper'>
                                <EditableDivMemo
                                    name={'tag'+idx}
                                    key={tag}
                                    props= {{...tagProps,idx}}
                                ></EditableDivMemo>
                                {(editing)?
                                    <div 
                                        className="tag delete unselectable"
                                        onClick={() => deleteTag(idx)}
                                    >x</div>
                                    :<></>
                                }
                            </div>
                            : <></>)
                )   })
            }
        </div>
    )
}

export default Tags
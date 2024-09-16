import React , { useState,useEffect,memo } from 'react'

import EditableDiv from '../common/EditableDiv'

function Tags ({ article, setArticle, editing }) {
    const updateContent = (props) => {
        var name = props.cursor.field
        var idx = parseInt(props.cursor.field.slice(3))
        var newTags = [ ...article.tags ]
        newTags[idx] = props[name]
        var newCursor = props.cursor
        setArticle({tag: { operation:'update', idx:props.cursor.idx, value: props[name] }, cursor: newCursor})
    }

    function addTag () { 
        setArticle({    tag:   {operation:'add'}   })
    }

    function deleteTag (idx) { 
        setArticle({    tag:   {operation:'delete',idx}   }) 
    }
    
    var tagProps = 
        {className:'tag',editing,content:article,setContent:updateContent,tag:true}
        
    return(
        <div className={"tags "+((editing)?'editing':'')}>
            {(editing)?
                <div className="tag-wrapper">
                    <div className="tag add unselectable"
                        onClick={addTag}    
                    >+</div>
                </div>
                :<></>
            }
            {   
                article.tags.map((tag,idx) => {
                    if(!editing && tag === '') return <></>
                    return  (
                            <div 
                                className={'tag-wrapper '
                                    +((editing)?'editing ':'unselectable ')
                                    }
                                key={'tag'+idx}
                            >
                                <EditableDiv
                                    name={'tag'}
                                    props= {{...tagProps,idx}}
                                ></EditableDiv>
                                {(editing)?
                                    <div 
                                        className="tag delete unselectable"
                                        onClick={() => deleteTag(idx)}
                                    >x</div>
                                    :<></>
                                }
                            </div>
                        
                )   })
            }
        </div>
    )
}

export default Tags
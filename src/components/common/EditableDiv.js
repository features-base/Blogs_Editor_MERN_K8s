import React, {useRef,useEffect} from "react"

import "./EditableDiv.css";

function EditableDiv({name, props: { className=' ', content, idx,tag, setContent, editable=true, editing=true, errorsProp } , enterEvent}) {
    const ref = useRef()
    //useEffect(() => {console.log(name,'first rerendering')},[])
    console.log(name,'rerendering',content.cursor)
    useEffect(() => {
        console.log(name,'first rerendering',content.cursor)
        if(content.cursor && content.cursor.field===name) {
            const newRange = document.createRange()
            var textDOM = ref.current.childNodes[1].firstChild
            
            console.log('textDOM :',textDOM)
            if(textDOM === null) {
                return;
            }
            newRange.setStart(ref.current.childNodes[1].firstChild, content.cursor.offset)
            const selection = document.getSelection()
            selection.removeAllRanges()
            selection.addRange(newRange)
        }
    },[])

    function onInput (e) {
        if(!e) return
        const clonedRange = document.getSelection().getRangeAt(0).cloneRange();
        var text = (e.currentTarget.textContent)?e.currentTarget.textContent:"";//<>&#8203;</>;
        var textMapping = {}
        for(let i=0;i<text.length;i++) textMapping[i] = text[i]+' '+text.charCodeAt(i).toString()
        console.log('onInput in ',name,' ',text)
        if(setContent) setContent({
            [name]: text,
            cursor: { field: name, offset: clonedRange.startOffset } 
        })
    }
    return(
        <div className={"type-area "+name+((editing)?" editing ":"")
            +((errorsProp && errorsProp[name]!==undefined)?" error ":"")
            +((editable)?' editable ':"")
            +className+' '    
            }
            ref={ref}
        >
                <div className="empty-div"></div>
                <div
                    className="text-div"
                    contentEditable={editing}
                    suppressContentEditableWarning
                    onKeyDown={(e) => { 
                        if(e.key === 'Enter' && enterEvent!==undefined) { 
                            e.preventDefault(); enterEvent()
                            return 
                        } 
                    }}
                    onClick={onInput}
                    onInput={onInput}
                >
                    {   (tag)?content.tags[idx]:
                        (content[name])
                            ?content[name].replaceAll('  ',String.fromCharCode(160)+' ')
                            :''
                    }
                </div>
        </div>
    )
}

export default EditableDiv;
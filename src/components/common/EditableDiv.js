import React, {useEffect, useRef} from "react"

/*
    EditableDiv is a div which allows the users to edit its text content.
    Its functionality is simlar to that of the HTML text-area element, 
        but it allows more customizations.
    It is basically a wrapper around a HTML div with contentEditable attribute.
*/
function EditableDiv({name, props: { className=' ', content, idx,tag, setContent, editable=true, editing=true, errorsProp } , enterEvent}) {
    const ref = useRef()
    const textContent = 
        tag
        ?content.tags[idx]
        :content[name]

    /*
        During every user type events, the EditableDiv component rerenders,
            followed which the browser repaints the component.
            This causes the browser to reset the text cursor to 
            the first character of the div.
            The followng useEffect, fixes the cursor after every such rerenders. 
    */
    useEffect(() => {
        if(ref.current) {
            if( content.cursor && content.cursor.field===name && 
                (!tag || (content.cursor.idx === idx))
            ) {
                const newRange = document.createRange()
                var textDOM = ref.current.childNodes[1].firstChild
                if(textDOM !== null) {
                    newRange.setStart(
                        ref.current.childNodes[1].firstChild, 
                        ((content.cursor.offset>textContent.length)
                            ?textContent.length
                            :content.cursor.offset) 
                    )
                    const selection = document.getSelection()
                    selection.removeAllRanges()
                    selection.addRange(newRange)
                }
            }
        }
    }, [content])

    function onInput (e) {
        if(!e) return
        const clonedRange = document.getSelection().getRangeAt(0).cloneRange();
        var text = (e.currentTarget.textContent)?e.currentTarget.textContent:"";
        var textMapping = {}
        for(let i=0;i<text.length;i++) 
            textMapping[i] = text[i]+' '+text.charCodeAt(i).toString()
        if(setContent) {
            setContent({
                [name]: text,
                /*  
                    The cursor offset will be used to fix the cursor, when the 
                        browser resets the cursor during every repainting.
                */
                cursor: { field: name, idx, offset: clonedRange.startOffset } 
            })
        }
    }

    return(
        <div className={"type-area "+name+((editing)?" editing ":" ")
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
                    onClick={ () => { if (editing) onInput() } }
                    onInput={onInput}
                >
                    {   
                    (tag)?content.tags[idx]:
                        (content[name])
                            ?content[name].replaceAll('  ',String.fromCharCode(160)+' ')
                            :''
                    }
                </div>
        </div>
    )
}

export default EditableDiv;
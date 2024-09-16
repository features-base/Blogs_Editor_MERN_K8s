import React, {useState} from "react"

function ButtonCustom ({ option }) {
    const [ hovering , setHovering ] = useState(false)
    return (
        <div 
            key={option.name}
            className={"button-custom unselectable "+
                option.name
                +" "+((option.selected)?" selected":"")
                +" "+((option.defaultColor)?option.defaultColor:"")
                +" "+((option.disabled)?"disabled":"")}
            onClick = {(e)=> {
                e.preventDefault();e.stopPropagation()
                if(!option.disabled)
                    option.handler() 
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >  
            {
            ((option.svg.svgJsx)?option.svg.svgJsx:
            ( (option.svg.pathD)?
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                {option.svg.pathD.map((d,idx) => {
                    return (
                        <path key={idx} d={d}/>
                    )
                })}
            </svg>
            : option.svg.svgJSX
            ))
            }
            {(hovering)?
                (option.disabled)?
                    ((option.disabledHoverText)?
                        <div className="hoverText">
                            { option.disabledHoverText }
                        </div>
                    :
                        <></>)
                :
                (option.hoverText)?
                    <div className="hoverText">
                        { option.hoverText }
                    </div>
                    :<></>
                :
            <></>
            }
        </div>
    )

}

export default ButtonCustom;
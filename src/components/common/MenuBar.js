import React, {useContext} from "react";

import ButtonCustom from "./ButtonCustom"
import { AppContext } from "../../App";

function MenuBar ({options: { id, options }}) {

    const { dragProps: { positions , startDragging } } = useContext(AppContext)

    return(
        <div className="menuBar"
            style={{
                top: positions[id].y ,
                left: positions[id].x ,
            }}
        >
            <div className="menuOptions">
                    {options.map((option,idx) => {
                        return( 
                            <ButtonCustom key={idx} option={option}></ButtonCustom>
                        )
                    })}
            </div>
            <div className="collapser controller">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-bar-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"/>
                </svg>
            </div>
            <div className="grip controller" 
                onMouseDown={(e) => startDragging(e,id)}
                //onMouseUp={()=>setDragging(false)}
                //onMouseLeave={()=>setDragging(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
                    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                </svg>
            </div>
        </div>
            
    )
}

export default MenuBar;
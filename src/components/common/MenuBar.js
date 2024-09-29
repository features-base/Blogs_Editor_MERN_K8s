import React, {useState,useReducer,useContext} from "react";

import ButtonCustom from "./ButtonCustom"
import { AppContext } from "../../App";


function MenuBar ({options: { id, options }}) {

    const { dragProps: { positions , startDragging } } = useContext(AppContext)
    const [ overflow , setOverflow ] = useState(false)
    const [ collapsed, collapsedDispatch ] = useReducer(
        (collapsed)=>{
            if(overflow !== collapsed) return collapsed
            if(!overflow) setOverflow(true)
            else    setTimeout(()=>setOverflow(false),500) ; 
            return !collapsed
        } , 
        false
    )

    return(
        <div className="menuBar"
            style={{
                top: positions[id].y ,
                left: positions[id].x ,
            }}
        >   
            <div className="menuOptionsPosition">
            <div className="menuOptions"
                style = {{ 
                    'transition': 'padding 0.5s, min-width 0.5s, max-width 0.5s',
                    'overflow': ((overflow)?'hidden':'visible'),
                    'minWidth': ((collapsed)?'0px':'284px'),
                    'maxWidth': ((collapsed)?'0px':'284px'),
                    'padding': ((collapsed)?'10px 0px':'10px 10px')
                }}
            >
                    {options.map((option,idx) => {
                        return( 
                            <ButtonCustom key={idx} option={option}></ButtonCustom>
                        )
                    })}
            </div>
            </div>
            <div className="collapser controller"
                onClick={() => collapsedDispatch()}
            >
                <svg xmlns="http://www.w3.org/2000/svg" 
                        transform={"rotate("+((collapsed)?0:180)+")"} 
                        width="16" height="16" fill="currentColor" className="bi bi-arrow-bar-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"/>
                </svg>
                <div className="hover-text">
                    { 'Click to expand or collapse the menu bar' }
                </div>
            </div>
            <div className="grip controller" 
                onMouseDown={(e) => startDragging(e,id)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
                    <path 
                        d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                </svg>
                <div className="hover-text">
                    { 'Click and drag to move the menu bar' }
                </div>
            </div>
        </div>
            
    )
}

export default MenuBar;
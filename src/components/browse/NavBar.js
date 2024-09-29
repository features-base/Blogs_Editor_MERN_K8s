import React, {useContext,useTransition,useState} from "react";

import { AppContext } from "../../App";
import SearchBar from "../common/SearchBar";

import Profile from "./Profile";

function NavBar () {

    const { route, setRoute } = useContext(AppContext)
    const [ navigating , startNavigation ] = useTransition()
    const [ navigatingTo , setNavigatingTo ] = useState('')
    var navBarOptions = {
        pages : [
            /*{
                name: "home" ,
            },*/
            {
                name: "articles" ,
            },
            /*{
                name: "authors" ,
            },*/
            {
                name: "create" ,
            },
            {
                name: "about" ,
            },
            //{
            //    name: "api" ,
            //}
        ]
    }
    
    return (
        <div className="nav-bar">
            <SearchBar
            ></SearchBar>
            <div className="nav-buttons-space vertical-align">
                <nav className="nav-buttons horizontal-align">
                { 
                    navBarOptions.pages.map((page,idx)=>{
                        return(
                            <div
                                className={"nav-button "+
                                    ((route.path[0]===page.name)?'selected ':'')+
                                    ((navigatingTo === page.name && route.path[0] !== navigatingTo)?'navigatingTo ':'')
                                }
                                onClick={()=>{
                                    setNavigatingTo('/'+page.name)
                                    startNavigation(() => {setRoute('/'+page.name)})
                                }}
                                key={idx}
                            >
                                {page.name}
                            </div>
                        )
                    })
                }
                </nav>
            </div>
            <Profile></Profile>
        </div>
    )

}

export default NavBar;
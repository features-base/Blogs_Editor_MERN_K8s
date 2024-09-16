import React, {useState} from "react"

import ButtonCustom from "../common/ButtonCustom"
import EditableDiv from "./EditableDiv";

function SearchBar({ search=()=>{} , className="" }) {

    const [searchTerm,setSearchTerm] = useState("");

    var searchBarOptions = {
        erase: { 
            name: "erase",
            selected: false,
            handler: ()=>{setSearchTerm("")},
            svg: {
                pathD:[
                    "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
                ]
            }
        } ,
        search: { 
            name: "search",
            selected: false,
            handler: ()=>{ search(searchTerm.searchTerm) },
            svg: {
                pathD:[
                    "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" 
                ]
            }
        }
    }

    const editableDivProps = { content: searchTerm, setContent: setSearchTerm,
        preventEnter: true, enterEvent: searchBarOptions.search.handler
    }

    return(
        <div className={"search-bar "+className}>
            <EditableDiv
                name='searchTerm'
                props={editableDivProps}
            ></EditableDiv>
            <ButtonCustom option={searchBarOptions.erase}></ButtonCustom>
            <ButtonCustom option={searchBarOptions.search}></ButtonCustom>
        </div>
    )
}

export default SearchBar;
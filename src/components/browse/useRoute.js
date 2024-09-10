import React, { useReducer } from "react"

const routeReducer = (route,newUriString=window.location.pathname) => {
    var queryIndex = newUriString.indexOf('?')
    var queryString = '', path, newPath = newUriString, newRoute
    if(queryIndex>-1) {
      queryString = newUriString.slice(queryIndex)
      newPath = newUriString.slice(0,queryIndex)
    }
    path = newPath.split('/').slice(1).filter(directory => directory!=='')
    window.history.pushState({},'',newUriString)
    newRoute = {
      uriString:newUriString ,
      path ,
      queryString
    }
    return (newRoute)
  }

function useRoute() {
    const [route,setRoute] = useReducer(routeReducer, { uriString:'/', path:[], queryString:'' } )
    return [route,setRoute]
}

export default useRoute
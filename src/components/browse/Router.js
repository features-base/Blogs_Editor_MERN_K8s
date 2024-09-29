import React, {useContext,Suspense,Profiler} from "react"
import {AppContext} from "../../App"
import About from "./About"
import Article from "../article/Article"
import Articles from "../article/Articles"

//  The below import lines are commented out to disable lazy loading
//      When the chunks get larger, the below syntax can be used
//  const Article = lazy(() => import("../article/Article"))
//  const Articles = lazy(() => import("../article/Articles"))

//  The scope of the onRender callback for Profiler components
var enableProfilerLogging = process.env.REACT_ENABLE_PROFILER_LOGGING , profilerLogCount=0
if(enableProfilerLogging === undefined) enableProfilerLogging = false
function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {
    if(enableProfilerLogging != 'true') return
    profilerLogCount+=1
    console.groupCollapsed('Profiler Log '+profilerLogCount+' for '+id+' '+phase+':\n'+
        'actual :',actualDuration,' base :',baseDuration
    )
    console.dir({id, phase, actualDuration, baseDuration, startTime, commitTime})
    console.groupEnd()
}

//The Router controls navigation across different routes
function Router() {
    const { route } = useContext(AppContext)
    return (
        <Profiler id="Router" onRender={onRender}>
        <Suspense fallback={"Lazy Loading..."}>
            {   
                (route.path[0]==='articles')?<Articles></Articles>:
                (route.path[0]==='article')?<Article mode="full" articleId={route.path[1]}></Article>:
                (route.path[0]==='create')?<Article mode="create"></Article>:
                (route.path[0]==='about')?<About></About>:
                //(route.path[0]==='api')?<API></API>:
                //(route.path[0]==='user')?<User></User>:
                <></>
            }
        </Suspense>
            </Profiler>
    )
}

export default Router
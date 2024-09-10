import React, {useContext,lazy,Suspense,Profiler} from "react"
import {AppContext} from "../../App"

const Article = lazy(() => import("../article/Article"))
const Articles = lazy(() => import("../article/Articles"))

// The onRender callback scope for the Profiler Component
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
        <Suspense fallback={"Lazy Loading..."}>
            <Profiler id="Router" onRender={onRender}>
            {   
                (route.path[0]==='articles')?<Articles></Articles>:
                (route.path[0]==='article')?<Article mode="full" articleId={route.path[1]}></Article>:
                (route.path[0]==='create')?<Article mode="create"></Article>:
                (route.path[0]==='authors')?<Article mode="full" articleId='create'></Article>:
                //(route.path[0]==='user')?<User></User>:
                <></>
            }
            </Profiler>
        </Suspense>
    )
}

export default Router
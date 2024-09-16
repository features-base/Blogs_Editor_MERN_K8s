function getMenuOptions({session,editing,setEditing,article,setArticle,submitArticle,setNotification,API,articleOriginal,saved,setSaved}) {
    
    function saveToLocalStorage () {
        session.editing.local[article._id] = article
        window.localStorage.setItem("session", JSON.stringify(session))
        setSaved({...saved,local:true})
    }

    function loadFromLocalStorage () {
        var articleLocal 
        if(session.editing) {
            articleLocal = session.editing.local[article._id]
        }
        if(!articleLocal) {
            articleLocal = window.localStorage.getItem(article._id)
            if(articleLocal) {
                articleLocal = JSON.parse(articleLocal)
            }
        }
        if(!articleLocal || !(article instanceof Object || !articleLocal._id)) 
            return
        session.editing.local[article._id] = { ...articleLocal }
        setArticle({ ...articleLocal,type:'local'},)
        setSaved(saved => { return {...saved,local:true,updated:'local'} })                        
    }

    return ( 
        {
            article:    {
                id: 'article menuBar',
                options: [
                { 
                    name: "edit",
                    selected: editing,
                    hoverText: "Click to toggle editing",
                    handler: ()=>{setEditing(!editing)},
                    svg: {
                        pathD:[
                            "M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" 
                        ]
                    }
                }
                ,
                { 
                    name: "reset",
                    selected: saved.reset,
                    hoverText: "Click to reset the article",
                    handler: ()=>{
                        setArticle({ ...articleOriginal.current , type: 'reset' })
                    },
                    svg: {
                        pathD:[
                            "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                        ]
                    }
                }
                ,
                { 
                    name: "commitChanges",
                    selected: saved.committed,
                    hoverText: "Click to commit the changes",
                    disabled: !(session.state === 'loggedIn'),
                    disabledHoverText: "Login to save sessions in cloud",
                    handler: submitArticle,
                    svg: {
                        svgJsx: 
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cloud-check" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                                <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                            </svg>
                    }
                }
                ,
                { 
                    name: "saveSessionToCloud",
                    selected: saved.cloud,
                    hoverText: "Click to save the session in cloud",
                    disabled: !(session.state === 'loggedIn'),
                    disabledHoverText: "Login to save sessions in cloud",
                    handler: async ()=>{
                        var response = await API.accessResource({
                            resourceType: 'user',
                            operation: 'saveCloudSession',
                            body: { cloudSession: { [(article._id)?article._id:'create']: {...article} } }
                        })
                        if(response.status<200 || response.status>299) {
                            setNotification({ type: 'error', message: 'Error in saving the session.', details:response })
                            return
                        }
                        setNotification({type:'success', message:'Successfully saved the session in cloud'})
                        setSaved({...saved,cloud:true})
                    },
                    svg: { 
                        svgJsx: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cloud-arrow-up" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708z"/>
                        <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                        </svg>
                    }
                }
                ,
                { 
                    name: "loadSessionFromCloud",
                    selected: saved.cloud,
                    hoverText: "Click to load your saved session from cloud",
                    disabled: !(session.state === 'loggedIn'),
                    disabledHoverText: "Login to load saved sessions from cloud",
                    handler: async ()=>{
                        var response = await API.accessResource({
                            resourceType: 'user',
                            operation: 'loadCloudSession',
                        })
         
                        if(response.status<200 || response.status>299) {
                            setNotification({ type: 'error', message: 'No saved sessions in cloud.', details:response })
                            return
                        }
                        setNotification({type:'success', message:'Successfully loaded the session from cloud'})
                        setArticle({ type:'cloud' , ...response.data.cloudSession[(article._id)?article._id:'create'] })
                        setSaved({...saved,updated:'cloud'})
                    },
                    svg: {
                        svgJsx: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
                        <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                        </svg>
                    }
                }
                ,
                { 
                    name: "saveSessionToLocalStorage",
                    selected: saved.local,
                    hoverText: "Click to save your session in local storage",
                    disabled: !(session.state === 'loggedIn'),
                    disabledHoverText: "Login to save sessions in local storage",
                    handler: saveToLocalStorage,
                    svg: {
                        pathD:[
                            "M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v4.5h2a.5.5 0 0 1 .354.854l-2.5 2.5a.5.5 0 0 1-.708 0l-2.5-2.5A.5.5 0 0 1 5.5 6.5h2V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1z",
                          ]
                    }
                }
                ,
                { 
                    name: "loadSessionFromLocalStorage",
                    selected: saved.local,
                    hoverText: "Click to load your saved session from local storage",
                    disabled: !(session.state === 'loggedIn'),
                    disabledHoverText: "Login to load saved sessions from local stoaage",
                    handler: loadFromLocalStorage,
                    svg: {
                        pathD:[
                            "M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707z"
                          ]
                    }
                }
            ]
            }
            ,
            body: [
                { 
                    name: "insertImages",
                    selected: editing,
                    handler: ()=>{setEditing(!editing)},
                    svg: {
                        pathD:[
                            "M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
                            "M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"
                        ]
                    } 
                }
            ]
        }
    )
}

export default getMenuOptions
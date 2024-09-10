async function getSession({session:currentSession,API}) {
    const location = window.location;
    var session = window.localStorage.getItem("session")
    if(session && session!=="undefined") {
        session = JSON.parse(session)
        if(session.state === 'loggedIn') {
            return session;
        }
    }
    
    const queryFragments = new URLSearchParams(location.hash.substring(1));
    const accessToken = queryFragments.get("access_token")
    const idToken = queryFragments.get("id_token")
    if(!accessToken)   
        return { state: 'loggedOut' }
    
    var res = await API.accessResource({
        resourceType: 'user',
        operation: 'getUserInfo',
        body: {accessToken,idToken,session:currentSession}
    })
    if(res.status<200 || res.status>299)
        return { state: 'error' }
    
    var session = { ...res.data.session , state: 'loggedIn' }
    window.localStorage.setItem( "session" , JSON.stringify(session) )
    return session
}

export default getSession;
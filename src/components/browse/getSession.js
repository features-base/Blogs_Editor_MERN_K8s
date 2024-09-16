async function getSession({session:currentSession,setSession,API}) {
    const location = window.location;
    var session = window.localStorage.getItem("session")
    
    if(false){//{(session && session!=="undefined") {
        session = JSON.parse(session)
        if(session.state === 'loggedIn') {
            return session;
        }
    }
    
    const queryFragments = new URLSearchParams(location.hash.substring(1));
    //const accessToken = queryFragments.get("access_token")
    //const idToken = queryFragments.get("id_token")
    var authorizationCode = queryFragments.get("code")
    if(!authorizationCode) authorizationCode = window.env.code
    console.log('code :',authorizationCode)
    if(!authorizationCode)   
        return { state: 'loggedOut' }
    setSession({ ...currentSession , state: 'exchangingTokens' })
    var res = await API.accessResource({
        resourceType: 'user',
        operation: 'getGoogleOAuth2Claims',
        body: {session:currentSession,authorizationCode}
    })
    if(res.status<200 || res.status>299)
        return { state: 'error' }
    
    var session = { ...res.data.session , state: 'loggedIn' }
    window.localStorage.setItem( "session" , JSON.stringify(session) )
    return session
}

export default getSession;
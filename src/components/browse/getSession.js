async function getSession({session:currentSession,setSession,API}) {
    const location = window.location;
    
    //  Checking local storage
    var session = window.localStorage.getItem("session") 
    
    if(session && session!=="undefined") {
        session = JSON.parse(session)
        if(session.state === 'loggedIn') {
            return session;
        }
    }
    
    //  Checking for authorization code in URL
    //  Authorization code will be provided during redirect
    //      from OIDC IdP throudh URL query params
    const queryFragments = new URLSearchParams(location.hash.substring(1));
    var authorizationCode = queryFragments.get("code")

    //  During SSR, node server attaches the authCode
    //      to the window.env
    if (window.env)
        if(!authorizationCode) authorizationCode = window.env.code
    if(!authorizationCode)   
        return { state: 'loggedOut' }
    setSession({ ...currentSession , state: 'exchangingTokens' })
    
    //  Submiiting the Authorization code to backend API
    var res = await API.accessResource({
        resourceType: 'user',
        operation: 'getGoogleOAuth2Claims',
        body: {session:currentSession,authorizationCode}
    })
    if(res.status<200 || res.status>299)
        return { state: 'error' }
    
    var session = { ...res.data.session , state: 'loggedIn' }

    //  Storing in local storage
    window.localStorage.setItem( "session" , JSON.stringify(session) )
    return session
}

export default getSession;
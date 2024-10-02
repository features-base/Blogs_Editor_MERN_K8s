import React, {useState,useEffect} from "react"
import InMemoryStore from "../common/InMemoryStore"

function GoogleSignIn () {

    const [ OAuth2Endpoint , setOAuth2Endpoint ] = useState()

    useEffect(() => {
        var REACT_API_URL = InMemoryStore.store.cache.env.REACT_API_URL    
        if(!REACT_API_URL) 
            REACT_API_URL = process.env.REACT_API_URL
        var loginUri
        if(!REACT_API_URL) loginUri = "https://accounts.google.com/o/OAuth2/v2/auth?redirect_uri=https%3A%2F%2Flocalhost%3A3000&client_id=639506257680-1fa5smdb926pfacdgmhv8ijb882ujn9c.apps.googleusercontent.com&response_type=id_token%20token&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&flowName=GeneralOAuthFlow&nonce=n-0S6_WzA2Mj&key%3D=AIzaSyC0VfTk_XGGIoUy9Kj18xdR6Re3gMY_dLs"
        else loginUri = REACT_API_URL+'user/login'
        setOAuth2Endpoint(loginUri)
        InMemoryStore.subscribe(() => {
            if(InMemoryStore.store.cache.env.REACT_API_URL)
                setOAuth2Endpoint(InMemoryStore.store.cache.env.REACT_API_URL+'user/login')
        })
        
    }, [])

    
    return (
        <a className="google-sign-in" aria-label='Google Sign In' name='Google Sign In' rel='external' 
            href={OAuth2Endpoint}
        >
            {//onClick={() => window.open(OAuth2Endpoint,'Sign In with Google','popup')}
            }
                {//href={OAuth2Endpoint}>
                }
            <div className="gsi-button vertical-align">
                <div className="gsi-button-content horizontal-align">
                    <div className="gsi-svg">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width='20' viewBox="0 0 48 48" style={{display: 'block'}}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    )
}



export default GoogleSignIn
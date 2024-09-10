import React, {useState,useContext} from "react"

import "./Profile.css"

import { AppContext } from "../../App"
import ButtonCustom from "../common/ButtonCustom"

import GoogleSignIn from "./GoogleSignIn"

var guest = {
    name: 'Guest',
    picture: {
        svgOptions: {
            name: 'profile-picture',
            svg: {
                pathD: [
                    "M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
                ]
            },
            defaultColor: 'white'
        }
    } 
}



function Profile () {

    const { session , setSession , API , setNotification } = useContext(AppContext)
    
    const [hovering , setHovering] = useState(false)

    if(session.state === 'loggedOut') {
        return <GoogleSignIn></GoogleSignIn>
    }

    async function logout() {
        var response = await API.accessResource({
            resourceType: 'user',
            operation: 'logout'
        })
        if(response.status >= 200 && response.status <= 299 || response.status === 401) {
            setSession({ status:'loggedOut' , aes: session.aes, sessionId: session.sessionId })
            window.localStorage.removeItem('session')
        }
        else {
            setNotification({ type: 'error' , message: 'Error while logging out.' , details: response })
        }
    }

    return (
        <div className="profile vertical-align"
            onMouseEnter={()=>{setHovering(true)}}
            onMouseLeave={()=>{setHovering(false)}}
        >
            <div className="profile-align horizontal-align nav-button">
                <div className="picture vertical-align">
                    {
                        ((session.state === 'loggedIn' && session.userInfo.picture)?
                            <img 
                                src = {session.userInfo.picture}
                                alt = "google profile picture"
                                load = "eager"
                                
                            ></img>
                            :
                            <ButtonCustom option={guest.picture.svgOptions}></ButtonCustom>
                        )
                        
                    }
                </div>
                <div className="name vertical-align">
                    <div>
                    {
                        ((session.state==='loggedIn' && session.userInfo.name)?
                            session.userInfo.name
                        :
                        'Guest'
                        )
                    }
                    </div>
                </div>
            </div>
            {((hovering)?
            <div className="profile-nav">
                    {
                        ((session.state==='loggedIn')?
                        <>
                            <div className="element button"
                            >
                                Profile
                            </div>
                            <div 
                                className="element button"
                                onClick={logout}
                            >
                                Log Out
                            </div>
                        </>
                        :
                        <div className="element">
                            <GoogleSignIn></GoogleSignIn>
                        </div>    
                        )
                    }
            </div>
            :<></>
            )}
        </div>
    )
}

export default Profile
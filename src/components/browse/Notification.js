import React, { useContext } from 'react'

import { AppContext } from '../../App'

const typeSvgs = {
    'success': 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
        </svg>
  ,
  'error': 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
            <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
        </svg>
}

function Notification () {
    
    const { notification , setNotification } = useContext(AppContext)

    if(notification === undefined)
    return (
        <></>
    )

    setTimeout(() => {
        setNotification(undefined)
    }, [2000])

    return(
        <div className={'notification '+notification.type}>
            <div className='position' style={{
                'min-width': (notification.message.length+5)+'ch'
            }}>
                <div className='popup'>
                    <div className='type vertical-align'>
                        {
                            typeSvgs[notification.type]
                        }
                    </div>
                    <div className='message vertical-align'>
                        <div>
                            {notification.message+((notification.details)?' '+notification.details.statusText:"")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notification
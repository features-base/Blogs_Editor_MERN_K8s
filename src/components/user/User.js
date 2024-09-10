import React, { useState } from "react"


async function getUser({ userId }) {
    const user = window.localStorage.getItem(userId);
    return JSON.parse(user)
}

function User({ userId }) {

    //const [user,setUser] = useState(getUser({userId}))

    return (
        <div className="user">
        </div>
    )
}

export default User;
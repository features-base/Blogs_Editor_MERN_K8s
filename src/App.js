import React, {useState,createContext,useEffect,memo,lazy,Suspense} from 'react'

import NavBar from './components/browse/NavBar';
import useDrag from './components/common/useDrag';
import Notification from './components/browse/Notification';
import Router from './components/browse/Router'

import useAPI from './components/common/useAPI';
import useRoute from "./components/browse/useRoute"
import InMemoryStore from './components/common/InMemoryStore';
//const Router = import('./components/browse/Router')

const AppContext = createContext()

// The whole app layout is memoized to avoid unnecessary rerenders during global state changes 
const AppLayoutMemo = memo(()=>{
  return(
    <>
      <Notification></Notification>
      <NavBar></NavBar>
      <Router></Router>
    </>
  )
})

const setEnv = () => {
  if(window.env)
    InMemoryStore.store.cache.env = window.env
  else {
    InMemoryStore.store.cache.env = { 
      REACT_API_URL: 
        process.env.REACT_API_URL?process.env.REACT_API_URL:'http://localhost:3000/api/' 
    }
  }
  InMemoryStore.publish()
}

function App() {
  const [session,setSession] = useState({ state: 'loggedOut' })
  
  //  This hook maintains the uri routes and navigations
  const [route,setRoute] = useRoute()
  const [ notification, setNotification ] = useState(undefined)

  // This hook maintains the states of every draggable component 
  const dragProps = useDrag({'article menuBar':{x:500,y:40}})

  // This hook will attach session and other variables to the appropriate API requests 
  const API = useAPI({ session , setSession , setNotification })

  //  Loads the session state during app launch. 
  useEffect(() => { ( async () => {
    setEnv()
    setRoute()
    const sessionRes = await API.getSession()
    if(!sessionRes)
      setSession({ state: 'error' })
    else {
      setSession({...sessionRes,state:(sessionRes.state)?sessionRes.state:'loggedIn'})
    }
  } )() }, [])
  
  
  return (
    <div className="App">
      <AppContext.Provider value={ {session,setSession,API,dragProps,notification,setNotification,route,setRoute} }>
        <div 
          className="app-layout" 
          onMouseMove={dragProps.dragHandler}
          onMouseUp={()=>dragProps.setDragging(false)}
        >
          <AppLayoutMemo></AppLayoutMemo>      
        </div>
      </AppContext.Provider>
    </div>
  );
}

export { App , AppContext };

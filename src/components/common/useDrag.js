import React, { useDebugValue, useState } from "react"

//  Maintains every draggable components concerning the whole app layout
function useDrag(initialPositions) {

    //  The positions of every draggable component
    const [ positions, setPositions ] = useState(initialPositions)
    
    //  The component being dragged
    const [ dragging , setDragging] = useState(false)
    
    const [ prevXY , setPrevXY ] = useState()
    
    useDebugValue({
      dragging,
      ...((dragging)?{
        x: positions[dragging].x ,
        y: positions[dragging].y
      }:{})
    })
    const startDragging = (e,element) => {
      setDragging(element)
      setPrevXY([e.clientX,e.clientY])
    }
  
    const dragHandler = (e) => {
      if(!dragging) return
      setPrevXY([e.clientX,e.clientY])
      setPositions({
        ...positions,
        [dragging]: {
          x:positions[dragging].x+(e.clientX-prevXY[0]),
          y:positions[dragging].y+(e.clientY-prevXY[1])
        }
      })
    }
  
    const dragProps = { positions , startDragging, setDragging, dragHandler }
    return dragProps
  }

  export default useDrag
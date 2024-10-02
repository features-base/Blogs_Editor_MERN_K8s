function reportWebVitals(API) {

  function pushEntry(entry) {
    API.accessResource({
      resourceType: 'log',
      operation: 'push',
      body:  entry 
    })
  }

  function observe(list, observer) {
    try {
    const entries = list.getEntries()
    entries.map((entry,idx) => {
      console.log(entry)

      //  first-contentful-paint
      if(entry.name === 'first-contentful-paint') {
        if(entry.duration > 1800) 
          pushEntry({...entry,metric:'FCP'})
      }
      
      //  resource
      if(entry.entryType === 'resource') {
        if(entry.duration > 800) 
          pushEntry({...entry,metric:'resource'})
      }
      
      //  navigation
      if(entry.entryType === 'navigation') {
        if(entry.duration > 1500)
          pushEntry({...entry,metric:'navigation'})
      }

      if(entry.entryType === 'layout-shift') {
        if(!entry.hadRecentInput) {
          const shiftedNodes = entry.sources.map((attribution,idx) => {
            return({...attribution,node:attribution.node.className})
          })
          pushEntry({...entry,metric:'layout-shift',sources:shiftedNodes})
        }
      }

    })
    } catch(error) {
      console.groupCollapsed('error when reporting web vitals')
      console.dir(error)
      console.groupEnd()
     }
  }
  
  const observer = new PerformanceObserver(observe)
  
  observer.observe({ entryTypes: ["resource", "paint", "navigation"] });
  
  observe(performance,observer)
}

export default reportWebVitals;

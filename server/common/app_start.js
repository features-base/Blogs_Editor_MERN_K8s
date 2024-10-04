const fs = require('fs')
const path = require('path')

//  This file contains scripts to run during the container start

//  Making favicon availaable through static files url
async function moveFavicon () {
    fs.rename(
      path.join(__dirname,'/../../build/favicon.ico'),
      path.join(__dirname,'/../../build/static/favicon.ico'),
      (error) => { 
        //console.log('favicon error  /////\n',error) 
      }
    )
}
moveFavicon()

// Generates the script tag content and style tag content for SSR shell
function getBootstrapStrings () {
  
  //  Entrypoints to fetch for the chunks
  var entryPoints = JSON.parse(fs.readFileSync(
      path.join(__dirname,'/../../build/asset-manifest.json')))
      .entrypoints
  
  entryPoints[1] = 
          ((process.env.HOST_ENV === 'azure')?
            process.env.HOST_URL+'/':
            'https://localhost:443/'
          )
          +entryPoints[1]
          
  if(0) 
    entryPoints = entryPoints.map((entryPoint) => {
      return entryPoint.replace('https://localhost:443','http://localhost:80')
    })

  var reactEnv = {  }
  if(process.env.ENABLE_ADDITIOANL_TLS)
      reactEnv.REACT_ENABLE_ADDITIOANL_TLS = process.env.ENABLE_ADDITIOANL_TLS
  for (var key in process.env) {
    if(key.slice(0,5) === 'REACT')
      reactEnv[key] = process.env[key]
  }
  if(process.env.HOST_ENV === 'azure') {
    
    //  The URL used by the frontend to
    //    access the backend API
    reactEnv.REACT_API_URL = process.env.HOST_URL+'/api/'
    reactEnv.REACT_HOST_URL = process.env.HOST_URL
  }
  
  //  Runtime environment variables of the frontend 
  //    are set by a bootstrap script within the SSR shell
  var reactEnvString = JSON.stringify(JSON.stringify(reactEnv))

  //  The bootstrap script assigns runtime env to window.env
  var bootstrapScriptContentIntitial = 'window.env={...((window.env)?window.env:{}),...JSON.parse('+reactEnvString+')};'
  
  //  After that, the script tag removes itself from the HTML DOM
  bootstrapScriptContentIntitial += 'var envScriptElement = document.currentElement;'+
    'if(envScriptElement) envScriptElement.remove();'

  return { cssChunkFile: entryPoints[0] , bootstrapScripts: [ entryPoints[1] ] , bootstrapScriptContentIntitial }
}

module.exports = { ...getBootstrapStrings() } 
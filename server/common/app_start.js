const fs = require('fs')
const path = require('path')
async function moveFavicon () {
    fs.rename(
      path.join(__dirname,'/../../build/favicon.ico'),
      path.join(__dirname,'/../../build/static/favicon.ico'),
      (error) => { 
        //console.log('favicon error',error) 
      }
    )
}
moveFavicon()

function getBootstrapStrings () {
  const entryPoints = JSON.parse(fs.readFileSync(
      path.join(__dirname,'/../../build/asset-manifest.json')))
      .entrypoints
      .map(entryPoint => { 
        return ((process.env.HOST_ENV === 'azure')?
            process.env.HOST_URL+'/':
            'https://localhost:443/'
          )
          +entryPoint })
  
  var reactEnv = {}
  for (var key in process.env) {
    if(key.slice(0,5) === 'REACT')
      reactEnv[key] = process.env[key]
  }
  if(process.env.HOST_ENV === 'azure') {
    reactEnv.REACT_API_URL = process.env.HOST_URL+'/api/'
    reactEnv.REACT_HOST_URL = process.env.HOST_URL
  }
  var reactEnvString = JSON.stringify(JSON.stringify(reactEnv))
  var bootstrapScriptContentIntitial = 'window.env={...((window.env)?window.env:{}),...JSON.parse('+reactEnvString+')};'
  bootstrapScriptContentIntitial += 'var envScriptElement = document.currentElement;'+
    'if(envScriptElement) envScriptElement.remove();'
  return { bootstrapCSS: entryPoints[0] , bootstrapScripts: [ entryPoints[1] ] , bootstrapScriptContentIntitial }
}

module.exports = { ...getBootstrapStrings() } 
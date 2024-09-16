const express = require("express")
const React = require( "react")
const ReactDOMServer = require( "react-dom/server")
const AppSSR = require( "../src/AppSSR").default
const { bootstrapCSS, bootstrapScripts, bootstrapScriptContentIntitial } = require('./common/app_start')

const api = require( "./api")
const app = express()

app.use((req,res,next) => { console.log(
  'Request recieved =>','ip:',req.ip,'origin:',req.origin,'method:',req.method,'url:',req.originalUrl
); next() })

app.use('/static',express.static('./build/static'))

app.use('/api',api)

app.get('/*',async (req,res,next)=> {
  console.log('ssr req.path :',req.path,'req.query :',req.query)
  var bootstrapScriptContent = bootstrapScriptContentIntitial
  if(req.path === '/' && req.query.code) {
    bootstrapScriptContent = 'window.env = { code:"'+req.query.code+'"};'
      +bootstrapScriptContentIntitial
  }
  const { pipe, abort: _abort } = ReactDOMServer.renderToPipeableStream(
    <AppSSR 
      bootstrapCSS={[bootstrapCSS]} 
    />
    ,
    {
      bootstrapScriptContent,
      bootstrapScripts,
      onShellReady() {
        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        pipe(res);
      },
      onShellError() {
        res.statusCode = 500;
        res.send("<!doctype html><p>Loading...</p>");
      },
    }
  );
})

module.exports = app
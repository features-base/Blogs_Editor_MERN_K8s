const express = require("express")
const app = express()
const api = require( "./api")

const React = require( "react")
const ReactDOMServer = require( "react-dom/server")
const Shell = require( "../src/Shell").default
const { cssChunkFile, bootstrapScripts, bootstrapScriptContentIntitial } = require('./common/app_start')

const path = require('path')
const fs = require('fs')
const { logRequest , configureResponse: {global} } = require("./routes/middlewares")

// cssChunk contains the minified css code of the whole app.
const cssChunk = 
  //fs.readFileSync(
  //  'C:\\Projects\\Showcase\\MERN\\articles_scratch2\\build\\static\\css\\main.9dca4994.css'
  //  ,'utf8')
  fs.readFileSync(path.join('./dist',cssChunkFile),'utf8')

/*  
    The whole css definitions are embedded into a style tag within the shell of SSR 
      to avoid significant latency during the initial page load. Otherwise, users will 
      have to wait for the browser to fetch css chunks through dedicated packets.
*/
/*
    The initial shell of SSR is rendered only once, and is memoized into the 
      constant variable 'shell'. It will be reused across SSR sessions.
      The removes the delay between client request and shell ready event.
      This avoids significant servier-side computing overhead. 
      This also reduces page load latencies, thus improving FCP score.
*/
const shell = <Shell cssChunk={cssChunk}></Shell>

//  Minified react chunks are exposed as static files.
//  Used by SSR shell to load chunks.
app.use('/static',express.static('./dist'))

//  Mounting the API onto <protocol>://<HOST>/api/
app.use('/api',api)

//  Logging incoming http packets at entry gateway
app.use(logRequest)

//  Any get requests other than '/static' and '/api' are served with the 
//      website UI. The paths and params within the request URIs are assumed 
//      to be client agents' navigation paths and params respectively.
app.get('/*',async (req,res,next)=> {
  var bootstrapScriptContent = bootstrapScriptContentIntitial
  if(req.path === '/' && req.query.code) {
    
    //  If the request URI includes authorization code, 
    //    it is attached as a runtime env variable
    bootstrapScriptContent = 'window.env = { code:"'+req.query.code+'"};'
      +bootstrapScriptContentIntitial
  }
  
  //  Creating an SSR streaming instance
  const { pipe, abort: _abort } = ReactDOMServer.renderToPipeableStream(
    shell
    , 
    {
      bootstrapScriptContent,
      bootstrapScripts,
      onShellReady() {
        
        //  Streaming the shell
        //  NOTE: Shell will always be ready, because during the app launch itself,
        //    it was rendered and meemoized into the 'shell' variable.
        res.setHeader("Content-type", "text/html");
        pipe(res);
      },
      onShellError() {
        res.status(500).send("<h2>Status Code: 500<br/>Error during SSR...</h2>");
      },
    }
  );
})

module.exports = app
const express = require("express")
const React = require( "react")
const ReactDOMServer = require( "react-dom/server")
const fs = require('fs')
const path = require('path')
const AppSSR = require( "../src/AppSSR").default

const api = require( "./api")
const app = express()

const entryPoints = JSON.parse(fs.readFileSync(
  path.join(__dirname,'/../build/asset-manifest.json')))
  .entrypoints

app.use('/static',express.static('./build/static'))

app.use('/api',api)
console.log('initializing',)
app.get('/*',(req,res,next)=> {
  console.log('ssr handler')
  const { pipe, abort: _abort } = ReactDOMServer.renderToPipeableStream(
    <AppSSR bootstrapCSS={[entryPoints[0]]} />
    ,
    {
      bootstrapScripts: [entryPoints[1]],
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
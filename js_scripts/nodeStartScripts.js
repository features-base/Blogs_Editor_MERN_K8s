const fs = require("fs")
const path = require("path")
const app = require("../server/api")


//Editing index.css to import all other .css files.
//This reduces the number of chunks 
//  thereby avoiding unnecessary network requests
//  and reducing page load time

const bootstrapCSS = ''

var src = path.join(__dirname,'/../src')
const appPath = path.join(src,'App.js')
const appSsrPath = path.join(src,'AppSSR.js')

//  Reading App.js
var lines = fs.readFileSync(appPath,'utf8').split('\r\n')

//  Removing .css imports
lines   = lines.filter((line,idx) => 
    (   line.indexOf('.css') === -1 )
)

//  Writing AppSSR.js
fs.writeFileSync(appSsrPath,lines.join('\r\n'),{encoding:'utf8'})
const fs= require('fs')
const path = require('node:path'); 
const keyString = 

             fs.readFileSync(path.normalize(
                 `${__dirname}/server/ssl/https/key.pem`
             ))
//console.log(JSON.stringify(keyString.toString()))

console.log(JSON.stringify( {   value:keyString.toString() }    ))
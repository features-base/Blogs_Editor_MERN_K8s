const fs= require('fs')
const path = require('node:path');
const envPath = path.normalize(`${__dirname}/../.azure.production.env`)
const envString = 
    fs.readFileSync(envPath).toString()
const nodePortUrlPath = path.normalize(
    `${__dirname}/data/nodePortExposedUrl.txt`
)
var nodePortUrl = 
    fs.readFileSync(nodePortUrlPath).toString('latin1').split('\r\n')[0].slice(2)
const envLines = envString.split('\r\n').filter(line => line.length)
var key,value,equalsIndex
var nodePortUrlEncoded = ''
for(var i=0;i<nodePortUrl.length;i+=1) {
    if([0,13,10].includes( nodePortUrl.charCodeAt(i) )) continue
    nodePortUrlEncoded += nodePortUrl[i]
}
nodePortUrl = nodePortUrlEncoded
envLines.map((line,idx) => {   
    equalsIndex = line.indexOf('=')
    key = line.slice(0,equalsIndex)
    value = line.slice(equalsIndex+1) 
    if(key === 'HOST_URL')
        envLines[idx] = key+'='+nodePortUrl
})

fs.writeFileSync(envPath, envLines.join('\r\n'))

const fs= require('fs')
const path = require('node:path');
const envString = 
             fs.readFileSync(path.normalize(
                 `${__dirname}/../.azure.production.env`
             )).toString()
const manifestFilePath = path.normalize(
    `${__dirname}/../k8s_specs/local-azure-secret.yaml`
)
const secretManifestLines = 
             fs.readFileSync(manifestFilePath).toString().split('\r\n').slice(0,12)

const lines = envString.split('\r\n').filter(line => line.length)
var key,value,equalsIndex
lines.map((line,idx) => {   
    equalsIndex = line.indexOf('=')
    key = line.slice(0,equalsIndex)
    value = line.slice(equalsIndex+1)
    secretManifestLines.push('  '+key+':  '+Buffer.from(value).toString('base64'))
})

fs.writeFileSync(manifestFilePath, secretManifestLines.join('\r\n'))

const fs = require("fs")
const path = require("path")

//  Editing index.css to import all the other .css files.
//  This reduces the number of chunks 
//      to avoid unnecessary network requests
//      and reduce page load latencies

const lines = []
var folder, entities, entityContent,
    src = path.join(__dirname,'/../src')
const stack = [src]
var size = 0
while(stack.length) {
    folder = stack.pop()
    entities = fs.readdirSync(folder)
    entities.map(entity => {
        
        //  Pushing subdirectories onto the stack
        if(entity.indexOf('.') === -1) 
            stack.push(path.join(folder,entity))
        
        //  Handling .css files
        if(entity.slice(entity.length-4) === '.css') {
            entityContent = fs.readFileSync(path.join(folder,entity),'utf8').split('\r\n')
                .map(entityLine => {return(entityLine.trim())}).join('')
            size+=entityContent.length

            //  Importing every .css files from root.css
            lines.push(    
                '@import "'
                +'./'
                +path.relative(src,path.join(folder,entity)).replaceAll('\\','/')
                +'" ;'
            )           
        }
    })
}

fs.writeFileSync(src+'/root.css',lines.join('\n'),{encoding:'utf8'})
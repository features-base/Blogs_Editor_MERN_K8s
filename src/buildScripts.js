const fs = require("fs")
const path = require("path")

const lines = []
const stack = ['']
var folder, entities, entity
while(stack.length) {
    folder = stack.pop()
    entities = fs.readdirSync(path.join(__dirname , folder))
    entities.map(entity => {
        if(entity.indexOf('.') === -1) 
            stack.push(path.join(folder,entity))
        if(entity.slice(entity.length-4) === '.css')
            lines.push('@import "'
                +'./'+path.join(folder,entity).replaceAll('\\','/')
                +'" ;')
    })
}

fs.writeFileSync(__dirname+'/root.css',lines.join('\n'),{encoding:'utf8'})
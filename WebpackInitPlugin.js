const path = require('path')
const fs = require('fs')

class WebpackInitPlugin {

    static defaultOptions = {
        buildDir : './dist' ,
        publicDir: './public'
    }

    constructor(options) {
        this.options = { ...WebpackInitPlugin.defaultOptions, ...options }

        //  publicDir can be used to fetch some assets such as favicons
        if(!this.options.publicDir) {
            //  Resolving public folder in the project root
            const publicFolders = fs.readdirSync(__dirname).filter(file => ( 
                file.indexOf('public')  !== -1 
                &&
                file.indexOf('.') === -1
            ))
            if( publicFolders.length ) 
                this.options.publicDir = publicFolders[0]
        }
        if(!options.faviconPath) {
            // Checking if favicon relative path is provided
            if(this.options.favicon) this.options.faviconPath = path.resolve(
                __dirname,this.options.favicon
            )
            //  Resolving favicon in public folder, if it was not provided
            else if(this.options.publicDir) {
                const publicPath = path.resolve(__dirname,this.options.publicDir)
                const favicons = fs.readdirSync(publicPath).filter(file => (
                    file.indexOf('favicon') !== -1
                    &&
                    file.indexOf('.') !== -1
                ))
                if (favicons.length) 
                    this.options.faviconPath = path.resolve(publicPath,favicons[0])
            }
        }
    }

    apply(compiler) {
        compiler.hooks.environment.tap('WebkpackInitPlugin', (compilation) => {
            
            // Running custom js_scripts
            this.options.scripts.map(script => {
                require(script)
            })
            
            //  clearing ./dist content
            //  'clean' parameter of webpack configuration must be false
            //      otherwise, favicon will be deleted before emitting built chunks
            const buildPath = path.resolve(__dirname,this.options.buildDir)
            try {
                fs.rmSync(buildPath,
                    {    recursive: true    }
                )
            }
            catch (error) {  }
            fs.mkdirSync(buildPath)

            //   Copying favicon to the build output directory
            if(this.options.faviconPath) {
                fs.copyFileSync(    this.options.faviconPath , path.resolve(
                    __dirname, this.options.buildDir , path.basename( this.options.faviconPath )
                )   )
            }
        })
    }
}

module.exports = WebpackInitPlugin
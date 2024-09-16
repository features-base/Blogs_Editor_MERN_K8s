import React from "react"
import { App } from "./App";



const AppSSR = ({ bootstrapCSS }) => {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <link rel="icon" href="https://localhost:443/static/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    name="description"
                    content="A website to showcase my MERN skills"
                />
                <title>Articles</title>
                {
                    bootstrapCSS.map(cssPath => <link key={cssPath} rel="stylesheet" href={cssPath}></link>)
                }
            </head>
            <body>
                <div id="root">
                    <App/>
                </div>
            </body>
        </html>
    )
}

export default AppSSR;
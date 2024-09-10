import React from "react"
import { App } from "./App";

const AppSSR = ({ bootstrapCSS }) => {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Articles</title>
                {
                    bootstrapCSS.map(cssPath => <link key={cssPath} rel="stylesheet" href={cssPath}></link>)
                }
            </head>
            <body>
                <div id="root">
                    <App />
                </div>
            </body>
        </html>
    )
}

export default AppSSR;
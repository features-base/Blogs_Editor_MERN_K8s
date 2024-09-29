import React from 'react'

function About () {
    return (
        <div className='doc about vertical-align'>
            <div className="contact the Developer">
                <div className="key">contact the developer:
                </div>
                <a className="value" href="mailto:karansdexpert@gmail.com">
                    karansdexpert@gmail.com
                </a>
                </div>
            <div className='doc-content'>

            <h1>Articles</h1>

A MERN website to create, edit, and share articles. The built-in editor provides features to work and save your progress across sessions. The built-in search engine offers search functionalities across the entire collection of articles published by our users. We welcome your valuable feedback and suggestions for further improvements.

<h2>Architecture</h2>

The app's architecture, includes 3 tiers - server, front-end and database. The components are built based on REST and WS3 principles. The app's server is implemented using NodeJS, which facilitates building non-blocking asynchnorous, event-driven, single-threaded JS applications for high scalability, and is build on the V8 JS engine, supporting native C++ code integrations. The server includes a HTTPS RESTful API. The front-end is built using ReactJS, which faciltates building stateful modular components. The database is implemented using MongoDB Atlas, a NoSQL DBMS with built-in search engine. The server is dockerized and deployed in a serverless Azure Container App instance.

<h3>Authentication</h3>

The app supports Google Oauth2 authentication to ensure that the articles published by a user cannot be edited, or deleted by other users. Users can browse, create, or edit articles even without logging in. Once they are ready, they can log in to save their sessions, so that they can continue later, to edit their published articles, or to publish new ones. The built-in editor provides options to save the session in the browser's local storage as well as in the cloud server. The server tracks separate sessions for each article.

<h3>Security and Privacy</h3>

The Node.js server supports TLS handshake using SHA-256 (asymmetric) and AES-256-GCM (symmetric) encryptions along with key rotation during every request. This mechanism ensures privacy by allowing the client and the server to encrypt their communication payloads, thus preventing data leaks while transmitting packets through public or vulnerable networks. This ensures protection from packet sniffing attacks such as man-in-the-middle attacks. The key rotation avoids replay attacks.
<br/><br/>
The web app doesn't use cookies to store personal data such as session tokens, symmetric encryption keys, user info provided by the OAuth2 identity provider, etc... This ensures protection against CSRF ( Cross-site request forgery ) attacks.
<br/><br/>
The app has no third-party dependencies, and the entire app is built from scratch, thus offering protection from third-party vulnerabilities. This also provides reliability against third-party deprecations.
<br/><br/>
Google SSO is performed using OIDC with Authorization Code Flow, in which the user is redirected to Google SSO provider's consent screen, where the users can securely provide their consent, after which the SSO provider would send an authorization code to the app through a url query parameter. The app server submits the code along with a secret to the SSO provider to get the user info. The secret is never revealed publicly, thus preventing packet sniffers from utilizing the authorization code.
<h3>Performance and Caching</h3>

The app has no third-party dependencies, thus reducing the size of the built scripts. So, when users open the website, network load and latency are reduced while downloading the web app. In addition, the server combines server-side rendering with client-side rendering to reduce the website load time. Code splitting implemented through lazy loading minimizes the time taken before the client's device can display the initial screen of the website. Built script chunks are named with a hash of their contents, thus allowing the browsers to cache the chunk files.
<br/><br/>
The React UI is optimized with hooks such as useMemo, useCallback, and APIs such as memo to make functionalities like dragging, editing, drawing, etc... seamless and responsive. These hooks provide mechanisms for caching rendered components, thus preventing unnecessary rerenders even when the state of the components or the states of any of the components' ancestors change.
<br/><br/>
The UI provides efficiency and reduces latency while accessing data using different caching mechanisms. It accesses the recently cached data during the same session through an in-memory cache, while accessing the earlier or past sessions' cached data through a more persistent local storage. It stores large files like images in the browsers' IndexedDB which is also a persistent storage.

<h3>Design Patterns and Coding Standards</h3>

Global and common variables such as session info, and in-memory cache are made available to the consumer codes through singleton classes and Context API.
<br/>
Custom hooks such as useApi and useDrag improve the separation of concerns. The useApi hook separates the common and repeated patterns across API calls such as attaching session tokens, encryption and decryption, and TLS handshakes. The useDrag hook maintains the states of the positions of every draggable component concerning the whole app layout. 
The singleton class TLS maintains and offers a single TLS session across the entire app.
<br/>
An in-memory data store is implemented as a singleton class with static variables. It includes publish and subscribe functionalities. Singleton classes make the same benefits of state variables, to be available outside of custom hooks or function components. They also remove prop drilling. The data store is used to implement an in-memory cache. 
<br/><br/>
The Node.js server utilizes separate and intermediate middlewares to perform encryption and decryption of payloads, and authentication mechanisms at the entry and exit points of the packets, thus acting as a firewall. Common and CRUD operations are implemented as separate middlewares and reused across different resource types. 
Express app's built-in functions are modified to serve custom purposes. This avoids replacing function calls with different functions, or middlewares at each of their occurrences across the code.
The singleton class UserSessions maintains the session information of every user.

<h3>DBMS</h3>

The entire dataset is replicated across 3 nodes to increase availability and fault tolerance. The database collections are maintained by unique indexes to provide fast access and implement schema constraints. The Lucene-based search engine and aggregation pipelines allow customizable search and data processing queries. Transaction management is done for every query. Write and read concerns ensure reliability, consistency, and availability of data in real-time across regions. NoSQL database allows flexible schema, to support updations in app functionalities.
<br/>
IndexedDB, local storage, and in-memory data stores are used to manage data in clients' devices, based on the required data persistency, performance, speed, and efficiency.

<h3>Deployment and Containerization</h3>

During the build, the react app is bundled into different chunks based on the locality of reference. React's lazy loading API improves page load times through code splitting. Docker's optimization features such as bind mounts, and cache mounts are used to manage dependencies in seperate build stages, thus reducing cache invalidations during the react build step.
Environment variables are passed to the app in runtime using the browsers' window API. The window API is initialized with an env object using a self-destructing script tag, which is provided along with the initial shell of SSR.
<br/>
The source code is committed to the GitHub repo, where a GitHub actions workfow rebuilds a new docker image and pushes it to Azure Container Registry, after which, the workflow redeploys the Azure Container App as a serverless instance to publish the committed app to the end-users.
        </div>
        </div>
    )
}

export default About
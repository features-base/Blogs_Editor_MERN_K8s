import React from 'react'
import "./About.css"

function About () {
    return (
        <div className='about vertical-align'>
            <div className="contact the Developer">
                <div className="key">contact the developer:
                </div>
                <a className="value" href="mailto:karansdexpert@gmail.com">
                    karansdexpert@gmail.com
                </a>
                </div>
            <div className='about-content'>

            <h1>Articles</h1>

A MERN website to create, edit, and share articles. The built-in editor provides features to work and save your progress across sessions. The built-in search engine offers search functionalities across the entire collection of articles published by our users. We welcome your valuable feedback and suggestions for further improvements.

<h2>Architecture</h2>

<h3>Authentication</h3>

The app supports Google Oauth2 authentication to ensure that the articles published by a user cannot be edited, or deleted by other users. Users can browse, create, or edit articles even without logging in. Once they are ready, they can log in to save their sessions, so that they can continue later, to edit their published articles, or to publish new ones. The built-in editor provides options to save the session in the browser's local storage as well as in the cloud server. The server tracks separate sessions across different articles.

<h3>Security and Privacy</h3>

The Node.js server supports TLS handshake using SHA-256 (asymmetric) and AES-256-GCM (symmetric) encryptions along with key rotation during every request.
This mechanism ensures privacy by allowing the client and the server to encrypt their communication payloads, thus preventing data leaks while transmitting packets through public or vulnerable networks. This ensures protection from packet sniffing attacks such as man-in-the-middle attacks. The key rotation avoids replay attacks.
<br/>
The web app doesn't use cookies to store personal data such as session tokens, symmetric encryption keys, user info provided by the OAuth2 identity provider, etc... This ensures protection against CSRF ( Cross-site request forgery ) attacks.
<br/>
The app has no third-party dependencies, and the entire app is built from scratch, thus offering protection from third-party vulnerabilities. This also provides reliability against third-party deprecations.

<h3>Performance and Caching</h3>

The app has no third-party dependencies, thus reducing the size of the built scripts. So, when users open the website, network load and latency are reduced while downloading the web app. In addition, the server combines server-side rendering with client-side rendering to reduce the website load time. Code splitting implemented through lazy loading minimizes the time taken before the client's device can display the initial screen of the website. Built script chunks are named with a hash of their contents, thus allowing the browsers to cache the chunk files.
<br/>
The React UI is optimized with hooks such as useMemo, useCallback, and APIs such as memo to make functionalities like dragging, editing, drawing, etc... seamless and responsive. These hooks provide mechanisms for caching rendered components, thus preventing unnecessary rerenders even when the state of the components or the states of any of the components' ancestors change.
<br/>
The UI provides efficiency and reduces latency while accessing data using different caching mechanisms. It accesses the recently cached data during the same session through an in-memory cache, while accessing the earlier or past sessions' cached data through a more persistent local storage. It stores large files like images in the browsers' IndexedDB which is also a persistent storage.

<h3>Design Patterns and Coding Standards</h3>

Global and common variables such as session state, are made available to the consuming components through singleton classes and Context API.
Custom hooks such as useApi and useDrag improve the separation of concerns. The useApi hook separates the common and repeated patterns across API calls such as attaching session tokens, encryption and decryption, and TLS handshakes. The useDrag hook maintains the states of the positions of every draggable component concerning the whole app layout. 
The singleton class TLS maintains and offers a single TLS session across the entire app.
An in-memory data store is implemented as a singleton class with static variables. It includes publish and subscribe functionalities. This ensures that the same benefits of state variables are available outside of custom hooks or function components. The data store is used to implement an in-memory cache. 
<br/>
The Node.js server utilizes separate and intermediate middlewares to perform encryption and decryption of payloads, and authentication mechanisms at the entry and exit points of the packets, thus acting as a firewall. Common and CRUD operations are implemented as separate middlewares and reused across different resource types. 
Express app's built-in functions are modified to serve custom purposes. This avoids replacing function calls with different functions, or middlewares at each of their occurrences across the code.
The singleton class UserSessions maintains the session information of every user.

<h3>DBMS</h3>

The entire dataset is replicated across 3 nodes to increase availability and fault tolerance. The database collections are maintained by unique indexes to provide fast access and implement schema constraints. The Lucene-based search engine and aggregation pipelines allow customizable search and data processing queries. Transaction management is done for every query. Write and read concerns ensure reliability, consistency, and availability of data in real-time across regions.
IndexedDB, local storage, and in-memory data stores are used to manage data in clients' devices, based on the required data persistency, performance, speed, and efficiency.

<h3>Deployment and Containerization</h3>

During the build, the react app is bundled into different chunks based on the locality of reference. Docker's optimization features like bind mounts, and cache mounts are used to manage dependencies, thus reducing cache invalidations during the build step of the react app.
Environment variables are passed to the app in runtime using browsers' window APIs. The window API is initialized with env using a self-destructing script tag, which is provided along with the initial shell during SSR.
        </div>
        </div>
    )
}

export default About
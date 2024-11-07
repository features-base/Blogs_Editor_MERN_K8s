# Articles-Showcase

A **MERN Stack** website for users to create, edit, and share articles. The built-in editor provides features to work and save your progress across sessions. The built-in search engine offers search functionalities across the entire collection of articles.

**API Documentation**: [/README.API.md](/README.API.md)

![screenhot of editor page](https://github.com/x-v-app-source/Editor-SEO-OIDC_MERN-K8s-Azure/blob/production/documentation/screenshots/create_bigger%20-%20Copy.jpg?raw=true)
## Architecture

The app's architecture, includes **4 tiers - server, front-end. database, and usage analytics**. The components are built based on **REST and W S3** principles to develop independant portable components for high scalability. The app's server is implemented using **NodeJS**, which facilitates building non-blocking asynchnorous, event-driven, single-threaded JS applications for high scalability, and is built on the V8 JS engine, supporting native C++ code integration. The server includes a **HTTPS/2 RESTful API**. The front-end is built using **ReactJS**, which faciltates building stateful modular components, with built-in support for code splitting. The database is implemented using **MongoDB** Atlas, a NoSQL DBMS with built-in search engine. The server is **dockerized** and deployed in a **serverless** **Azure Container App** instance. The server was also deployed using Azure Kubernetes Service (**AKS**) with multiple replicas across availability zones and regions. **Usage data** including API requests, performance metrics, and **client-hints** are collected and stored in an Atlas database to be used for **analytics** purposes.

### Authentication

The app supports **Google SSO** authentication to ensure that the articles published by a user cannot be edited, or deleted by other users. Users can browse, create, or edit articles even without logging in. Once they are ready, they can log in to save their sessions, so that they can continue later, to edit their published articles, or to publish new ones. The built-in editor provides options to save the session in the browser's local storage as well as in the cloud server. The server can track separate sessions for each article.

### Security and Privacy

The **Node.js** server cannot be accessed without HTTPS. Also, the Node.js server provides dedicated APIs to manage additional TLS sessions on top of the existing TLS session within the HTTPS protocol, using **SHA-256 (asymmetric)**, and **AES-256-GCM (symmetric)** encryptions along with key rotation during every request.
This mechanism ensures privacy by allowing the client and the server to encrypt their communication payloads, thus preventing data leaks while transmitting packets through public or vulnerable networks. This ensures protection from packet sniffing attacks such as man-in-the-middle attacks. The key rotation avoids replay attacks.

The web app doesn't use **cookies** to store personal data such as session tokens, symmetric encryption keys, user info provided by the OAuth2 identity provider, etc... This ensures protection against **CSRF** ( Cross-site request forgery ) attacks.

The app has **no third-party dependencies**, and the entire app is built from scratch, thus offering protection from third-party vulnerabilities. This also provides reliability against third-party deprecations.

**Google SSO** is performed using **OIDC with PKCE flow**, in which the user is redirected to Google SSO provider's consent screen, where the users can securely provide their consent, after which the SSO provider would send an authorization code to the app through a url query parameter. The app server submits the code along with a secret, and a **code verifier** (both of which are required to get authorized by the IdP) to the SSO provider to get the user info. The secret, and the code verifier are never revealed publicly, thus preventing packet sniffers from utilizing the authorization code, which could have been exposed when the IdP provided the code through the url query parameter. In addition, the IdP's response is verified by the **nonce** provided by the IdP, thus preventing the authorization code, or the IdP's response getting tampered while the packets are in transit through public networks.

### Performance and Caching

The app has **no third-party dependencies**, thus reducing the size of the **built scripts** to lesser than 200 KB. So, when users open the website, **network load** and **latency** are reduced while downloading the web app. The server combines **server-side rendering (SSR)** with **client-side rendering (CSR)** to reduce the initial page load time and **FCP**. **Code splitting** implemented through **lazy loading** minimizes the network latency during page load. Built script chunks are named with a **hash** of their contents, thus allowing the browsers to **cache** the chunk files.
The **React UI** is optimized with **hooks** such as useMemo, useCallback, and APIs such as memo to make functionalities like dragging, editing, drawing, etc... **seamless** and **responsive**. These hooks provide mechanisms for **caching** rendered components, thus preventing unnecessary rerenders, even when the state of the components or the states of any of the components' ancestors change. 

The UI provides **efficiency** and reduces **latency** while accessing data using different **caching** mechanisms. It accesses the recently cached data during the same session through an **in-memory cache**, while accessing the earlier or past sessions' cached data through a more persistent **local storage**. It stores large files like images in the browsers' **IndexedDB** which is also a persistent storage.

The app utilizes the **performance API** of client agents, to ensure that the users are provided with the optimal performance. Whenever the users experience any issues like lack of responsiveness, latency in resource fetching, or inconvenient layout-shifts, the app reports, and logs the event. 
The app also **logs** every request made by the users along with details about the **user's device** ( memory, os, ip ), **client-agent** ( browser ), **network connection** ( bandwidth, RTT, ECT ), **preferences** ( color , language ), etc...
These reports and logs are **analysed** to solve problems, and improve the user experience.

### Design Patterns and Coding Standards

Global and common variables such as session info, and in-memory cache are made available to the consumer codes through **singleton classes** and **Context API**.
**Custom hooks** such as useApi and useDrag improve the **separation of concerns**. The useApi hook separates the common and repeated patterns across API calls such as attaching session tokens, encryption and decryption, and TLS handshakes. The useDrag hook maintains the states of the positions of every draggable component concerning the whole app layout. 
The **singleton class** TLS maintains and offers a single TLS session across the entire app.
An **in-memory data store** is implemented as a **singleton class** with **static variables**. It includes **publish and subscribe** functionalities. Singleton classes make equivalent benefits of state variables, to be available outside of custom hooks or function components. They also help in removing **prop drilling**. The data store is used to implement an in-memory cache. 

The **Node.js** server utilizes separate and intermediate **middlewares** to perform encryption and decryption of payloads, and authentication mechanisms at the entry and exit points of the packets, thus acting as a **firewall**. Common and CRUD operations are implemented as separate middlewares and reused across different resource types. 
**Express** app's built-in functions are **modified** to serve custom purposes. This avoids replacing function calls with different functions, or middlewares at each of their occurrences across the code.
The singleton class UserSessions maintains the session information of every user.

### DBMS

The entire dataset is **replicated** across 3 nodes to improve **availability**, and **partition tolerance**. The database collections are maintained by unique indexes to provide fast access. and implement schema constraints. The **Lucene-based search engine** and **aggregation pipelines** allow customizable search and data processing queries. **Transaction management** is done for every query. **Write and read concerns** ensure **reliability, consistency, and availability** of data in real-time across **regions**. **NoSQL** database allows **flexible schema**, to support **improvements to app functionalities**.  Request logs and usage metrics logs are collected and stored in the NoSQL database.
IndexedDB, local storage, and in-memory data stores are used to manage data in clients' devices, based on the required data persistency, performance, speed, and efficiency.

### Deployment and Containerization

During the build, **webpack** **minifies**, and **bundles** the react app into different **chunks**, so that least frequently modified codes can be cached in the browsers, thereby reducing page load times. The **custom webpack plugin**, "WebpackInitPlugin" is tapped into the **environment hook** to prepare the build output folder. The plugin also resolves the location of favicon, in order to copy the favicon into the build output folder. React's **lazy loading API** improves page load times through **code splitting**. **Docker**'s optimization features such as bind mounts, and cache mounts are used to manage dependencies in seperate build stages, thus reducing cache invalidations during the react build step.
**Environment variables** are passed to the **react app in runtime** using the browsers' **window object**. The window object is initialized with an env object using a self-destructing script tag, which is provided along with the initial **shell of SSR**.

The source code is committed to the GitHub repo, where a **GitHub actions workfow** rebuilds a new docker image and pushes it to **Azure Container Registry**, after which, the workflow redeploys the **Azure Container App** as a **serverless** instance to publish the committed app to the end-users.

**K8s** cluster was created and tested using **minikube**. The cluster was deployed and tested across **regions** and **availability zones** using **Azure AKS** by configuring the **nodeSelector** field of the **deployment** manifest. The deployment controller uses **rolling update** strategy, and includes a **readiness probe** to ensure that the probes are ready to listen to incoming requests. The k8s **secret manifest** for environment variables is automatically **generated** by the JS code './js_scripts/createK8sSecretManifest.js', which parses the .env file while encoding each value to **base64** to use in the manifest.

The folders **./.bat** and **./js_scripts** contain the scripts to **automate** development, and deployment operations such as starting, updating, and running minikube node, building, and running Docker containers, and committing, and pushing to GitHub. These files simplify the development workflow by replacing frequently used complex command sequences with simple one line commands.

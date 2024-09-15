## API Specification ( Application Programming Interface Specification)

## TLS - Transport Layer Security

<h3>/api/tls/handshake</h3> 
<pre>
To establish a TLS session through a TLS handshake.
<b>Methods Allowed :</b> POST
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>encryption :</b> The encryption method used. It must be set to "public" for this client hello.
  <b>payload :</b> 256 byte AES key encrypted using the public key of the TLS certificate 
<b>Response :</b> The server hello
  <b>200 :</b> Session has been successfully established 
      <b>data :</b>  
        <b>sessionId :</b> A newly created generated unique session id 
        <b>ciphertext :</b> An empty JSON object encrypted using the AES key 
        <b>iv :</b> Initialization Vector
        <b>authTag :</b> AES-256-GCM auth tag for the ciphertext 
</pre>

## Symmetric Encryption

<h3>/api/** (Any resource)</h3> - This is a general specification applicable across all the APIs
<pre>
To use the AES key after the TLS handshake
<b>Methods Allowed :</b> POST/PUT/DELETE
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>sessionId :</b> The session ID generated during the TLS handshake 
  <b>iv :</b> AES-256-GCM Initialization Vector for the payload
  <b>authTag :</b> AES-256-GCM auth tag for the payload
  <b>payload :</b> The actual body for the underlying API, but encrypted using the AES key 
<b>Response :</b>
  <b>419 :</b> The TLS session has expired. Please initiate a new TLS handshake.
  <b>** :</b> Refer the specification of the underlying API to understand the status code
      <b>data :</b>  
        <b>sessionId :</b> A newly created generated unique session id 
        <b>ciphertext :</b> The actual response data of the underlying API, but encrypted using the AES key 
        <b>iv :</b> AES-256-GCM Initialization Vector for the ciphertext 
        <b>authTag :</b> AES-256-GCM auth tag for the ciphertext 
</pre>

## User Authentication 

For resources that require authentication, session token must be provided. 
Once a user logs in and submits the authorization code, a session token will be provided to the user.
It can either be attached to the body of the requests that access protected resources, or 
  to the 'Authorization' header as the keyword 'bearer' followed by the session token.

<h3>/api/user/login</h3>
<pre>
To perform Google OAuth2 login. Once logged in, you will be redirected to the Articles home page
  which will submit the authorization code to the following API "api/user/getGoogleOAuth2Claims".
<b>Methods Allowed :</b> GET
<b>Response :</b>
  <b>302 :</b> Redirection to the Google OAuth2 consent screen
  <b>500 :</b> Internal server error
</pre>

<h3>/api/user/getGoogleOAuth2Claims</h3>
<pre>
To submit the Google Oauth2 authorization code to get the user claims and a session token
<b>Methods Allowed :</b> POST
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>accessToken :</b> The access token received from the Google Oauth2 IdP
<b>Response :</b>
  <b>200 :</b> The claims have been successfully retrieved from the IdP 
      <b>data :</b>  
        <b>session :</b> A JSON object with session information
          <b>userInfo :</b> A JSON object containing the requested user claims
          <b>sessionToken :</b> A string to identify the user during the session.
                [NOTE: This is different from the session IDs which are associated with the TLS sessions]
  <b>207 :</b> Request successfull. But error while storing the claims in the service provider's database
      <b>data :</b> Same as the data for the status code 200.
  <b>401 :</b> Invalid accessToken
  <b>500 :</b> Internal server error
</pre>

## Manage user edit sessions

<h3>/api/user/saveCloudSession</h3>
<pre>
To save an editing session in the cloud, so that the session can be continued later
<b>Methods Allowed :</b> POST/PUT
<b>Authentication :</b> required
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>sessionToken :</b> The session token provided during authentication
  <b>cloudSession :</b> The JSON object representing the editing session
<b>Response :</b>
  <b>200 :</b> The session has been successfully saved in cloud
  <b>400 :</b> cloudSession object field required
  <b>401 :</b> Authorization credentials required
  <b>422 :</b> Invalid sessionToken
  <b>500 :</b> Internal server error
</pre>

<h3>/api/user/loadCloudSession</h3>
<pre>
To fetch the saved editing sessions from the cloud
<b>Methods Allowed :</b> POST
<b>Authentication :</b> required
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>sessionToken :</b> The session token provided during authentication
<b>Response :</b>
  <b>200 :</b> The session has been successfully retrieved from cloud
    <b>data :</b>
      <b>cloudSession :</b> A JSON object representing the saved sessions
  <b>401 :</b> Authorization credentials required
  <b>422 :</b> Invalid sessionToken
  <b>500 :</b> Internal server error
</pre>

## Article
<h3>/api/article/search</h3>
<pre>
To search through the articles
<b>Methods Allowed :</b> POST
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>searchSpecs :</b> A JSON object to use as the query for $search stage in MongoDB Atlas aggregation pipeline.
<b>Response :</b>
  <b>200 :</b> Search results have been successfully processed. ( This also includes empty search results )
      <b>data :</b>  
        <b>searchResults :</b> An array of articles
  <b>400 :</b> searchSpecs body field required and it must be a JSON object
  <b>422 :</b> Unprocessible entity. Refer the response statusText and data for details
  <b>500 :</b> Internal server error
</pre>

<h3>/api/article/getOne</h3>
<pre>
To fetch an article by its id
<b>Methods Allowed :</b> POST
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>id :</b> The unique ID of the article
<b>Response :</b>
  <b>200 :</b> The article has been successfully identified 
      <b>data :</b>  
        <b>article :</b> The fetched article
  <b>400 :</b> id body field required and it must be a string
  <b>401 :</b> Unauthorized request. Please provide authorization credentials.
  <b>422 :</b> Invalid id
  <b>500 :</b> Internal server error
</pre>

<h3>/api/article/update</h3>
<pre>
To update or upsert an article
<b>Methods Allowed :</b> POST/PUT
<b>Authentication :</b> required
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>article :</b> The new article document
  <b>upsert :</b> Boolean specifying the whether insertion allowed
<b>Response :</b>
  <b>200 :</b> The article has been successfully created 
      <b>data :</b>  
        <b>upsertedId :</b> The id of the newly inserted document if an upsert was performed
  <b>400 :</b> article body field required and it must be a JSON object
  <b>422 :</b> Unprocessible entity. Refer the response statusText and data for details
  <b>409 :</b> An article with the title already exists. Change the title of the article.
  <b>500 :</b> Internal server error
</pre>

<h3>/api/article/delete</h3>
<pre>
To delete an article
<b>Methods Allowed :</b> POST/DELETE
<b>Authentication :</b> required
<b>Content-Type :</b> application/json 
<b>Body :</b>  
  <b>id :</b> The id of the article to be deleted
<b>Response :</b>
  <b>200 :</b> The article has been successfully deleted 
  <b>400 :</b> id field required and it must be a string
  <b>422 :</b> Invalid id
  <b>409 :</b> There is no article with the specified id
  <b>500 :</b> Internal server error
</pre>

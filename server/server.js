const app = require('./app.js')
const fs = require('fs');
const https = require('https');

var PORT = process.env.PORT

if (process.env.HOST_ENV === 'azure') {
  if(!PORT) PORT = 80
  app.listen(PORT, () => {
    console.log("App is running on http://localhost:"+PORT);
    console.log("Replica is published on\n",process.env.CONTAINER_APP_URL)
    console.log("App is published on\n",process.env.HOST_URL)
  });  
}
else  {
  if(!PORT) PORT = 443
  const server = https.createServer({
    key: fs.readFileSync(`${__dirname}/ssl/https/key.pem`, 'utf8'),
    cert: fs.readFileSync(`${__dirname}/ssl/https/cert.pem`, 'utf8')
  }, app);

  console.log("Server is starting at https://localhost:"+PORT)

  server.listen(process.env.PORT);

  console.log("Server is listening at https://localhost:"+PORT)
}
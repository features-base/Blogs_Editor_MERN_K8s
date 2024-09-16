const app = require('./app.js')
const fs = require('fs');
const https = require('https');

var PORT = process.env.PORT
  if(!PORT) 
    PORT = 3000

if (process.env.ENVIRONMENT === 'production') {
  const server = https.createServer({
    key: fs.readFileSync(`${__dirname}/ssl/https/key.pem`, 'utf8'),
    cert: fs.readFileSync(`${__dirname}/ssl/https/cert.pem`, 'utf8')
  }, app);

  console.log("Server is starting at "+process.env.HOST_URL)

  server.listen(process.env.PORT);

  console.log("Server is listening at "+process.env.HOST_URL)
}
else  {
  app.listen(PORT, () => {
    console.log("App is running on http://localhost:3000");
  });  
}
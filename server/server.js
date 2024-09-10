const app = require('./app.js')
const fs = require('fs');
const http = require('https');
console.log('----')
app.listen(3000, () => {
  console.log("App is running on http://localhost:3000");
});

/*
const server = http.createServer({
  //key: fs.readFileSync(`${__dirname}/node-server/ssl/https/key.pem`, 'utf8'),
  //cert: fs.readFileSync(`${__dirname}/node-server/ssl/https/cert.pem`, 'utf8')
}, app);

var PORT = process.env.PORT
//if(!PORT) 
  PORT = 3000

console.log("Server is starting at port "+PORT)

server.listen(process.env.PORT);

console.log("Server is listening at port "+PORT)

module.exports = server;
*/
var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
 
 
// serve static files from the current directory
app.use(express.static(__dirname));

//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;
 
//create an instance of EurecaServer
var eurecaServer = new EurecaServer();
 
//attach eureca.io to our http server
eurecaServer.attach(server); 
 
server.listen(8000);
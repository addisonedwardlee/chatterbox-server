var http = require("http");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
// this was used for implementation without Express JS
// var requestHandler = require("./request-handler.js")
var app = express();

//Server info
var port = 3000;
var ip = "127.0.0.1";

//Cors headers for requests/responses
var corsHeaders = function(req, res, next){
  res.header("access-control-allow-origin", "*");
  res.header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("access-control-allow-headers", "content-type, accept");
  res.header("access-control-max-age", 10);
  if(res.method === "OPTIONS") {res.send(200)};
  next();
};

//App config
app.use(corsHeaders);
app.use(bodyParser());

//Create the server
var server = app.listen(port, ip, function() {
  console.log("listening to ", server.address());
});

//Storage variable
var allMessages = [];

//Get/Post
app.get("/*", function(req, res) {
  var output = filterMessages(req.query);
  res.send({results: output});
});

app.post("/*", function(req, res) {
  req.body.createdAt = +new Date();
  allMessages.unshift(req.body);
  res.send(201);
});

//Helper functions
var filterMessages = function(queryObj) {
  console.log(queryObj);
  var limit = queryObj.limit || 30;
  var output = [];
  var index = 0;
  while(limit > 0 && index < allMessages.length) {
    var match = true;
    if(queryObj.where){
      for(var keys in queryObj.where) {
        if(queryObj.where[keys] !== allMessages[index][keys]) {
          match = false;
          break;
        }
      }
    }
    if(match){
      output.push(allMessages[index]);
      limit--;
    }
    index++;
  }
  return output;
};

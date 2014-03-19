var http = require("http");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
// var requestHandler = require("./request-handler.js")
var app = express();

var port = 3000;
var ip = "127.0.0.1";

var corsHeaders = function(req, res, next){
  res.header("access-control-allow-origin", "*");
  res.header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("access-control-allow-headers", "content-type, accept");
  res.header("access-control-max-age", 10);
  if(res.method === "OPTIONS") {res.send(200)};
  next();
};

app.use(corsHeaders);
app.use(bodyParser());

var server = app.listen(3000, ip, function() {
  console.log("listening to ", server.address());
});

var allMessages = [];

app.get("/*", function(req, res) {
  var output = {results : []};
  output.results = allMessages;
  res.send(output);
});

app.post("/*", function(req, res) {
  req.body.createdAt = +new Date();
  allMessages.unshift(req.body);
  res.send(201);
});






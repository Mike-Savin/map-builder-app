var express = require('express');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;
var app = express();
global.base = __dirname;
app.use("/", express.static(__dirname + "/public"));
app.listen(port);
/*
 * Basic app routing using express
 * @author Jonathan Lam
 */
var express = require("express");
var app = express();
app.use(express.static("public"));
app.listen(process.env.PORT || 5000);

var express = require("express");
var app = express();

app.get("/", function(res, req) {
    res.redirect("http://johnjennings.net");
});

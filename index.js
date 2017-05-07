var express = require("express");
var app = express();

app.get("/", function(res, req) {
    res.redirect("http://johnjennings.net");
});

const portNumber = process.env.PORT || 8080;
app.listen(portNumber, function() {
    console.log("Server started on port " + portNumber);
});

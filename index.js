var express = require("express");
var app = express();

app.use("/", express.static("static"));

// app.get("/", function(req, res) {
    // res.redirect("http://johnjennings.net");
// });

// 404 route - redirect home
app.get("*", function(req, res) {
    res.redirect("/");
});

const portNumber = process.env.PORT || 8080;
app.listen(portNumber, function() {
    console.log("Server started on port " + portNumber);
});

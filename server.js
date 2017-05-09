// Load modules
var compression = require("compression");
var express = require("express");

// Create server
var app = express();

// Enable compression for smaller network transfer
app.use(compression());

// Serve static files
app.use("/", express.static("static"));

// 404 route - redirect home
app.get("*", function(req, res) {
    res.redirect("/");
});

// Start server on heroku defined port, or 8080 if not present
const portNumber = process.env.PORT || 8080;
app.listen(portNumber, function() {
    console.log("Server started on port " + portNumber);
});

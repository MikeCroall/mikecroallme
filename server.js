// Load modules
var compression = require("compression");
var express = require("express");
var mongodb = require("mongodb");

// Create server
var app = express();

// Connect to database
var mongoClient = mongodb.MongoClient;
const dbuser = process.env.dbuser;
const dbpass = process.env.dbpass;
const dburi = "mongodb://" + dbuser + ":" + dbpass + "@ds137121.mlab.com:37121/mikecroallmestats";
var objectID = mongodb.ObjectID;
var db;
mongoClient.connect(dburi, function(err, database_object) {
    if (err) {
        console.log("Failed to connect to database\n", err);
    } else {
        db = database_object;
    }
});

// Enable compression for smaller network transfer
app.use(compression());

// Serve static files
app.use("/", express.static("static"));

// LinkedIn redirect
app.get("/linkedin", function(req, res) {
    res.redirect("https://www.linkedin.com/in/mike-croall/");
});

// GitHub redirect
app.get("/github", function(req, res) {

    db.collection("stats").findOne({
        type: "main"
    }, function(err, document) {
        if(err) {
            console.log("Loading stats failed", err);
        } else {
            console.log("GOT STATS DOC", document);
            // TODO increment document
            db.collection("stats").save(document, function(err, results) {
                if (err) {
                    console.log("Saving stats failed", err);
                }
            });
        }
    });

    res.redirect("https://www.github.com/MikeCroall");
});

//Flickr redirect
app.get("/flickr", function(req, res) {
    res.redirect("https://www.flickr.com/photos/mcroall");
});

// 404 route - redirect home
app.get("*", function(req, res) {
    res.redirect("/");
});

// Start server on heroku defined port, or 8080 if not present
const portNumber = process.env.PORT || 8080;
app.listen(portNumber, function() {
    console.log("Server started on port " + portNumber);
});

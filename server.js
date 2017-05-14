// Load modules
var express = require("express");
var compression = require("compression");
var mongodb = require("mongodb");
var path = require("path");
var favicon = require("serve-favicon");

// Create server
var app = express();
var mongoClient = mongodb.MongoClient;
var objectID = mongodb.ObjectID;

// Get current directory differently if local or on heroku
const currentDirectory = (process.env.PORT) ? process.cwd() : __dirname;

// Setup database consts
const dbuser = process.env.dbuser;
const dbpass = process.env.dbpass;
const dburi = "mongodb://" + dbuser + ":" + dbpass + "@ds137121.mlab.com:37121/mikecroallmestats";

// Connect to database and save connection
var db;
mongoClient.connect(dburi, function(err, database_object) {
    if (err) {
        console.log("Failed to connect to database\n", err);
    } else {
        db = database_object;
    }
});

// Stats increment
function incrementStatByOne(linkName) {
    if(db) {
        db.collection("stats").findOne({
            type: "main"
        }, function(err, document) {
            if(err) {
                console.log("Loading stats failed", err);
            } else {
                if(document[linkName]) {
                    document[linkName] += 1;
                } else {
                    document[linkName] = 1;
                }
                db.collection("stats").save(document, function(err, results) {
                    if (err) {
                        console.log("Saving stats failed", err);
                    }
                });
            }
        });
    } else {
        console.log("No database connection, stats not updated");
    }
}

// Enable compression for smaller network transfer
app.use(compression());

// Enable custom favicon
app.use(favicon(path.join(currentDirectory, "static", "favicon.ico")));

// Serve static files
app.use("/", express.static("static"));

// LinkedIn redirect
app.get("/linkedin", function(req, res) {
    incrementStatByOne("linkedinClicks");
    res.redirect("https://www.linkedin.com/in/mike-croall/");
});

// GitHub redirect
app.get("/github", function(req, res) {
    incrementStatByOne("githubClicks");
    res.redirect("https://www.github.com/MikeCroall");
});

//Flickr redirect
app.get("/flickr", function(req, res) {
    incrementStatByOne("flickrClicks");
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

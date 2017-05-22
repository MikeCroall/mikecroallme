// Load modules
var express = require("express");
var compression = require("compression");
var mongodb = require("mongodb");
var path = require("path");
var favicon = require("serve-favicon");
// var auth = require("basic-auth");
var exphbs = require("express-handlebars");
var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;


// Options
const globalBackgroundImage = "overview-prog-small.jpg";

// Create objects from requirements
var app = express();
var mongoClient = mongodb.MongoClient;

// Get current directory differently if local or on heroku
const currentDirectory = (process.env.PORT) ? process.cwd() : __dirname;

// Setup admin auth for stats
const statsUserID = process.env.requiredUserId;
const statsUserEMAIL = process.env.requiredUserEmail;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Setup database consts
const dbuser = process.env.dbuser;
const dbpass = process.env.dbpass;
const dburi = "mongodb://" + dbuser + ":" + dbpass + "@ds137121.mlab.com:37121/mikecroallmestats";

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Setup auth
passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: "http://mikecroall.me/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }));

// Connect to database and save connection
var db;
mongoClient.connect(dburi, function(err, database_object) {
    if (err) {
        if (err.code == 18) {
            console.log("Could not connect to mlab from localhost");
        } else {
            console.log("Failed to connect to database\n", err);
        }
    } else {
        db = database_object;
    }
});

// Stats increment
function incrementStatByOne(linkName, value) {
    if (!value) {
        value = 1;
    }
    if (db) {
        var updateField = {};
        updateField[linkName] = value;
        db.collection("stats").update({
            type: "main"
        }, {
            $inc: updateField
        });
    } else {
        console.log("No database connection, stat" + linkName + " not updated");
    }
}

// Set up rendering for stats page
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Enable compression for smaller network transfer
app.use(compression());

// Enable custom favicon
app.use(favicon(path.join(currentDirectory, "static", "favicon.ico")));

// Serve static files
app.use("/", express.static("static"));

// Auth callback route
app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/"
    }),
    function(req, res) {
        if (req.user) {
            const userID = req.user.id;
            const userEmail = req.user.emails[0].value;

            if (userID && userEmail && userID === statsUserID && userEmail === statsUserEMAIL) {
                if (db) {
                    db.collection("stats").findOne({
                        type: "main"
                    }, function(err, document) {
                        if (err) {
                            console.log("Loading stats for admin failed", err);
                            res.redirect("/");
                        } else {
                            res.render("stats", {
                                layout: false,
                                doc: document
                            });
                        }
                    });
                } else {
                    res.redirect("/");
                }
            } else {
                res.redirect("/");
            }
        } else {
            res.redirect("/");
        }
    }
);

// Home page
app.get("/", function(req, res) {
    incrementStatByOne("homeVisits");
    res.render("index", {
        layout: false,
        backgroundImage: globalBackgroundImage
    });
});

// About page
app.get("/about", function(req, res) {
    incrementStatByOne("aboutVisits");
    res.render("about", {
        layout: false,
        mike: {
            ageInYears: ((new Date() - new Date(1997, 4, 8)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(0),
            imageToShow: "me1.jpg",
        },
        backgroundImage: globalBackgroundImage
    });
});

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

// Stats route
app.get("/stats",
    passport.authenticate('google', {
        failureRedirect: '/',
        scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
    })
);

// 404 route - redirect home
app.get("*", function(req, res) {
    incrementStatByOne("requests404");
    incrementStatByOne("homeVisits", -1);

    if(db) {
        db.collection("stats").update({
            type: "main"
        }, {
            $addToSet: { routesOf404: req.url }
        });
    }

    res.redirect("/");
});

// Start server on heroku defined port, or 8080 if not present
const portNumber = process.env.PORT || 8080;
app.listen(portNumber, function() {
    console.log("Server started on port " + portNumber);
});

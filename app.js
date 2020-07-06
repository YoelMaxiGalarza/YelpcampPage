//Dependencies Imports
const   express = require("express"),
        app = express(),
        bodyParser = require("body-parser"),
        mongoose = require("mongoose"),
        methodOverride = require("method-override"),
        passport = require("passport"),
        LocalStrategy = require("passport-local");
//File Imports
const   Campground = require("./models/campground"),
        Comment = require("./models/comments"),
        seedDB = require("./seeds"),
        User = require("./models/user");

var commentRoutes = require("./routes/comments")
var campgroundRoutes = require("./routes/campgrounds")
var authRoutes = require("./routes/auth")
//seedDB();
//Connecting to Data Base
mongoose.connect("mongodb://localhost/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});
//Methods to use
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty win cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});
app.use(authRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.listen(3000, function () {
    console.log("The yelpcamp server has started");
});
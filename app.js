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
//Connecting to Data Base
mongoose.connect("mongodb://localhost/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//Methods to use
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//seedDB();
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
//Landing Page
app.get("/", function (req, res) {
    res.render("landing");
});
//INDEX - Show all campgrounds
app.get("/campgrounds", function (req, res) {
    req.user
    //get all the campgrounds from the db
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user})
        }
    });
});
//CAMPGROUND CREATE ROUTE - add new campground to DB
app.post("/campgrounds", function (req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = { name: name, image: image, description: desc };
    //Create a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});
//DELETE CAMPGROUND AND COMMENTS
app.delete("/campgrounds/:id/delete", function (req, res) {
    // Find the campground
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
            //create new comment
        } else {
            campground.comments.forEach(function (idcomment) {
                Comment.findByIdAndRemove(idcomment, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Eliminando comentarios");
                    }
                });
            });
            Campground.findByIdAndRemove(req.params.id, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Campground Borrado!");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});
//COMMENTS CREATE ROUTE - add a new comment to the selected campground
app.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
            //create new comment
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect campground show page
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//CAMPGROUND NEW ROUTE - Show form to create new campground
app.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new")
});
//COMMENTS NEW ROUTE - add a new comment to a campground
app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
    //find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) console.log(err);
        else res.render("comments/new", { campground: campground });
    });
});
//SHOW - show more info about one campground
app.get("/campgrounds/:id", function (req, res) {
    //finde the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});
//=======================
//AUTHENTICATION ROUTES
//=======================
//REGISTRATION ROUTES====================================================
app.get("/register", (req, res) =>{
    res.render("register");
});
app.post("/register", (req, res)=>{
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        });
    });
});
//========================================================================
//LOGGIN ROUTES===========================================================
//Login view--------------------------------------------------------------
app.get("/login",(req, res) =>{
    res.render("login");
});
//Handling Login Logic----------------------------------------------------
app.post("/login", passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
}), (req, res)=>{});
//LOG OUT ROUTE===========================================================
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.listen(3000, function () {
    console.log("The yelpcamp server has started");
});
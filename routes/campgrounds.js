const   express = require("express");
const   router = express.Router();
        methodOverride = require("method-override"),
        Campground = require("../models/campground"),
        Comment = require("../models/comments");

//INDEX - Show all campgrounds
router.get("/", function (req, res) {
    req.user
    //get all the campgrounds from the db
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds})
        }
    });
});
//CAMPGROUND NEW ROUTE - Show form to create new campground
router.get("/new", isLoggedIn, function (req, res) {
    res.render("campgrounds/new")
});
//CAMPGROUND CREATE ROUTE - add new campground to DB
router.post("/", isLoggedIn, function (req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: name, image: image, description: desc, author: author };
    //Create a new campground and save to DB
    Campground.create(newCampground, isLoggedIn, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated);
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});
//SHOW - show more info about one campground
router.get("/:id", function (req, res) {
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
//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", isLoggedIn, (req, res)=>{
    Campground.findById(req.params.id, (err, foundCampground)=>{ 
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});
//UPDATE CAMPGROUND ROUTE
router.put("/:id", (req, res)=>{
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds/" + updatedCampground.id);
        }
    });
    //redirect somewhere(showpage)
});
//DELETE CAMPGROUND AND COMMENTS
router.delete("/:id/delete", isLoggedIn, function (req, res) {
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
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};
module.exports = router;
const   express = require("express");
        router = express.Router();
        Campground = require("../models/campground"),
        Comment = require("../models/comments");
//INDEX - Show all campgrounds
router.get("/campgrounds", function (req, res) {
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
router.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new")
});
//CAMPGROUND CREATE ROUTE - add new campground to DB
router.post("/campgrounds", function (req, res) {
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
//SHOW - show more info about one campground
router.get("/campgrounds/:id", function (req, res) {
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
//DELETE CAMPGROUND AND COMMENTS
router.delete("/campgrounds/:id/delete", function (req, res) {
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
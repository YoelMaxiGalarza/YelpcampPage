const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    Campground = require("./modules/models/campground"),
    Comment = require("./modules/models/comments"),
    seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//seedDB();

/* Campground.create({
    name: "Granite Hill",
    image: "data:image/jpeg;base64,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",
    description: "This is a huge granite hill, no bathrooms. No water. Beatiful granite!"
}); */
//Landing Page
app.get("/", function (req, res) {
    res.render("landing");
});
//INDEX - Show all campgrounds
app.get("/campgrounds", function (req, res) {
    //get all the campgrounds from the db
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds })
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
            Campground.findByIdAndRemove(req.params.id, function(err){
                if(err){
                    console.log(err);
                } else{
                    console.log("Campground Borrado!");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});
//COMMENTS CREATE ROUTE - add a new comment to the selected campground
app.post("/campgrounds/:id/comments", function (req, res) {
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
app.get("/campgrounds/:id/comments/new", function (req, res) {
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


app.listen(3000, function () {
    console.log("The yelpcamp server has started");
});
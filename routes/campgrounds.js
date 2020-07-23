const express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    Comment = require("../models/comments"),
    middleware = require("../middleware");
multer = require('multer');
storage = multer.diskStorage({

    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dxrsro7wf',
    api_key: 518615995118748,
    api_secret: "NEYRV2Ug7xdjtnCd3awP-9fWpmI"
});

//INDEX - Show all campgrounds
router.get("/", function (req, res) {
    req.user
    //get all the campgrounds from the db
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds })
        }
    });
});
//CAMPGROUND NEW ROUTE - Show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new")
});
//CAMPGROUND CREATE ROUTE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        //add image's public_id to campground object
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        Campground.create(req.body.campground, function (err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
    });
});
//SHOW - show more info about one campground
router.get("/:id", function (req, res) {
    //finde the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            if (!foundCampground) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});
//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (!foundCampground) {
            req.flash("error", "Item not found.");
            return res.redirect("back");
        }
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});
//UPDATE CAMPGROUND ROUTE
router.put("/:id", upload.single('image'), function (req, res) {
    Campground.findById(req.params.id, async function (err, campground) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success", "Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
//DELETE CAMPGROUND AND COMMENTS
router.delete("/:id/delete", middleware.checkCampgroundOwnership, function (req, res) {
    // Find the campground
    Campground.findById(req.params.id, async function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
            //create new comment
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            campground.comments.forEach(function (idcomment) {
                Comment.findByIdAndRemove(idcomment, function (err) {
                    if (err) {
                        console.log(err);
                        res.redirect('back');
                    } else {
                        console.log("Eliminando comentarios");
                    }
                });
            });
            Campground.findByIdAndRemove(req.params.id, function (err) {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                } else {
                    console.log("Campground Borrado!");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});
module.exports = router;
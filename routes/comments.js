const campground = require("../models/campground");
const { route } = require("./campgrounds");
const middleware = require("../middleware");
const   express = require("express"),
        router = express.Router({mergeParams: true}),
        Campground = require("../models/campground"),
        Comment = require("../models/comments");
//COMMENTS CREATE ROUTE - add a new comment to the selected campground
router.post("/", middleware.isLoggedIn, function (req, res) {
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
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
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
//COMMENTS NEW ROUTE - add a new comment to a campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    //find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) console.log(err);
        else res.render("comments/new", { campground: campground });
    });
});
//COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
    Campground.findById(req.params.id, (err, campground)=>{
        if (err) {
            console.log(err);
        } else {
           Comment.findById(req.params.comment_id, (err, foundComment)=>{
                if (err) {
                    res.redirect("back")
                } else {
                    res.render("comments/edit", { campground: campground, comment: foundComment});
                }
            }); 
        }
    });
});
//COMMENTS UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/" + req.params.id );
        }
    });
});
//COMMETNS DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
    //findbyid and remove
    Comment.findByIdAndRemove(req.params.comment_id, (err, foundComment)=>{
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});



module.exports = router;
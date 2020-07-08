const Campground = require("../models/campground")
const Comment = require("../models/comments")
//All the middleware goes here
var middlewareObj = {};
//Checking the author of the comment
middlewareObj.checkCommentOwnership = (req, res, next) => {
    //is user logged in
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("/back");
            } else {
                if (!foundComment) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                //does user own the comment?
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash('error','You need to be logged to do that!!');
        res.redirect("back");
    }
}
//Checking the author of the campground
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    //is user logged in
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {

                res.redirect("/back");
            } else {
                if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                //does user own the campground?
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        console.log("YOU NEED TO BE LOGGED IN TO DO THAT!!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please log in");
    res.redirect("/login");
};
module.exports = middlewareObj;
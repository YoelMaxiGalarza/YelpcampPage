const   express = require("express"),
        router = express.Router(),
        passport = require("passport"),
        User = require("../models/user");
//Landing Page
router.get("/", function (req, res) {
    res.render("landing");
});
//REGISTRATION ROUTES====================================================
router.get("/register", (req, res) =>{
    res.render("register");
});
router.post("/register", (req, res)=>{
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash('error', err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelpcamp " + user.username); 
            res.redirect("/");
        });
    });
});
//========================================================================
//LOGGIN ROUTES===========================================================
//Login view--------------------------------------------------------------
router.get("/login",(req, res) =>{
    res.render("login");
});
//Handling Login Logic----------------------------------------------------
router.post("/login", passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
}), (req, res)=>{});
//LOG OUT ROUTE===========================================================
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out !");
    res.redirect("/");
});

module.exports = router;
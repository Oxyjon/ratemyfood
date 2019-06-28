var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Root Route
router.get("/", function(req, res) {
  res.render("landing");
});

//=========================
//======AUTH ROUTE=========
//=========================

//Show register Form
router.get("/register", function(req, res) {
  res.render("register");
});
//Handle sigup form
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    age: req.body.age,
    avatar: req.body.avatar
  });
  if (req.body.adminCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to RateMyFood! " + user.username);
      res.redirect("/plate");
    });
  });
});

//show log-in form
router.get("/login", function(req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/plate",
    failureRedirect: "/login",
    failureFlash: "Failed to LogIn",
    successFlash: "Welcome back!"
  }),
  function(req, res) {}
);

//logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/plate");
});
module.exports = router;

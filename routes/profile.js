var express = require("express");
var router = express.Router();
var Plate = require("../models/plate");
var User = require("../models/user");
var middleware = require("../middleware");

//Profile
//SHOW
router.get("/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("Error, Something went wrong!");
    } else {
      Plate.find({}, function(err, foundPlate) {
        if (err) {
          req.flash("Error, Something went wrong!");
        } else {
          res.render("profile/show", { user: foundUser, plates: foundPlate });
        }
      });
    }
  });
});

//EDIT
router.get("/:id/edit", middleware.checkProfileOwnership, function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    res.render("profile/edit", { user: foundUser });
  });
});

//UPDATE
router.put("/:id", function(req, res) {
  //find and update the correct plate
  User.findByIdAndUpdate(req.params.id, req.body.user, function(
    err,
    updatedUser
  ) {
    if (err) {
      res.redirect("/plate");
    } else {
      res.redirect("/profile/" + req.params.id);
    }
  });
});

module.exports = router;

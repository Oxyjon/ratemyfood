var Plate = require("../models/plate");
var User = require("../models/user");
var Review = require("../models/review");
//all middleware goes here
var middlewareObj = {};

middlewareObj.checkPlateOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Plate.findById(req.params.id, function(err, foundPlate) {
      if (err || !foundPlate) {
        req.flash("error", "Plate not found");
        res.redirect("/plate");
      } else {
        //does user own it
        if (foundPlate.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You dont have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, function(err, foundReview) {
      if (err || !foundReview) {
        res.redirect("back");
      } else {
        // does user own the it?
        if (foundReview.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkProfileOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, function(err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Plate not found");
        res.redirect("/plate");
      } else {
        // does user own the it?
        if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You dont have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkReviewExistence = function(req, res, next) {
  if (req.isAuthenticated()) {
    Plate.findById(req.params.id)
      .populate("reviews")
      .exec(function(err, foundPlate) {
        if (err || !foundPlate) {
          req.flash("error", "Plate not found.");
          res.redirect("back");
        } else {
          // check if req.user._id exists in foundPlate
          var foundUserReview = foundPlate.reviews.some(function(review) {
            return review.author.id.equals(req.user._id);
          });
          if (foundUserReview) {
            req.flash("error", "You already wrote a review.");
            return res.redirect("/plate/" + foundPlate._id);
          }
          // if the review was not found, go to the next middleware
          next();
        }
      });
  } else {
    req.flash("error", "You need to login first.");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("back");
};

module.exports = middlewareObj;

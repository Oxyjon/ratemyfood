var express = require("express");
var router = express.Router({ mergeParams: true });
var Plate = require("../models/plate");
var Review = require("../models/review");
var middleware = require("../middleware");

//Index
router.get("/", function(req, res) {
  Plate.findById(req.params.id)
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
    })
    .exec(function(err, plate) {
      if (err || !plate) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.render("reviews/index", { plate: plate });
    });
});

//New
router.get(
  "/new",
  middleware.isLoggedIn,
  middleware.checkReviewExistence,
  function(req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the plate, only one review per user is allowed
    Plate.findById(req.params.id, function(err, plate) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      res.render("reviews/new", { plate: plate });
    });
  }
);

//Create
router.post(
  "/",
  middleware.isLoggedIn,
  middleware.checkReviewExistence,
  function(req, res) {
    //lookup plate using ID
    Plate.findById(req.params.id)
      .populate("reviews")
      .exec(function(err, plate) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        Review.create(req.body.review, function(err, review) {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          //add author username/id and associated plate to the review
          review.author.id = req.user._id;
          review.author.username = req.user.username;
          review.plate = plate;
          //save review
          review.save();
          plate.reviews.push(review);
          // calculate the new average review
          plate.rating = calculateAverage(plate.reviews);
          //save plate
          plate.save();
          req.flash("success", "Your review has been successfully added.");
          res.redirect("/plate/" + plate._id);
        });
      });
  }
);

//Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function(
  req,
  res
) {
  Review.findById(req.params.review_id, function(err, foundReview) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    res.render("reviews/edit", {
      plate_id: req.params.id,
      review: foundReview
    });
  });
});

//Update
router.put("/:review_id", middleware.checkReviewOwnership, function(req, res) {
  Review.findByIdAndUpdate(
    req.params.review_id,
    req.body.review,
    { new: true },
    function(err, updatedReview) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      Plate.findById(req.params.id)
        .populate("reviews")
        .exec(function(err, plate) {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          // calculate average
          plate.rating = calculateAverage(plate.reviews);
          //save changes
          plate.save();
          req.flash("success", "Your review was successfully edited.");
          res.redirect("/plate/" + plate._id);
        });
    }
  );
});

//Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function(
  req,
  res
) {
  Review.findByIdAndRemove(req.params.review_id, function(err) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Plate.findByIdAndUpdate(
      req.params.id,
      { $pull: { reviews: req.params.review_id } },
      { new: true }
    )
      .populate("reviews")
      .exec(function(err, plate) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        // calculate average
        plate.rating = calculateAverage(plate.reviews);
        //save changes
        plate.save();
        req.flash("success", "Your review was deleted successfully.");
        res.redirect("/plate/" + req.params.id);
      });
  });
});

function calculateAverage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  var sum = 0;
  reviews.forEach(function(element) {
    sum += element.rating;
  });
  return sum / reviews.length;
}

module.exports = router;

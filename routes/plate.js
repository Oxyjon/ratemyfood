var express = require("express");
var router = express.Router();
var Plate = require("../models/plate");
var Review = require("../models/review");
var middleware = require("../middleware");

//INDEX - show all
router.get("/", function(req, res) {
  //get all from DB
  Plate.find({}, function(err, allPlates) {
    if (err) {
      console.log(err);
    } else {
      res.render("plate/index", {
        plates: allPlates,
        currentUser: req.user
      });
    }
  });
});
//CREATE
router.post("/", middleware.isLoggedIn, function(req, res) {
  //get data from form and add to the array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newPlate = {
    name: name,
    image: image,
    description: desc,
    author: author
  };
  //create new post and save to DB
  Plate.create(newPlate, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect to plate page
      res.redirect("/plate");
    }
  });
});
//NEW - Show form to create new post
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("plate/new");
});

// SHOW - shows more info about one post
router.get("/:id", function(req, res) {
  //find the post with provided ID
  Plate.findById(req.params.id)
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } }
    })
    .exec(function(err, foundPlate) {
      if (err) {
        console.log(err);
      } else {
        //render show template with that post
        res.render("plate/show", { plate: foundPlate });
      }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkPlateOwnership, function(req, res) {
  Plate.findById(req.params.id, function(err, foundPlate) {
    res.render("plate/edit", { plate: foundPlate });
  });
});

//UPDATE
router.put("/:id", middleware.checkPlateOwnership, function(req, res) {
  //find and update the correct plate
  Plate.findByIdAndUpdate(req.params.id, req.body.plate, function(
    err,
    updatedPlate
  ) {
    if (err) {
      res.redirect("/plate");
    } else {
      res.redirect("/plate/" + req.params.id);
    }
  });
});

// DESTROY
router.delete("/:id", middleware.checkPlateOwnership, function(req, res) {
  Plate.findById(req.params.id, function(err, plate) {
    if (err) {
      res.redirect("/plate");
    } else {
      // deletes all reviews associated with the cplate
      Review.remove({ _id: { $in: plate.reviews } }, function(err) {
        if (err) {
          console.log(err);
          return res.redirect("/plate");
        }
        //  delete the plate
        plate.remove();
        req.flash("success", "Plate deleted successfully!");
        res.redirect("/plate");
      });
    }
  });
});

module.exports = router;

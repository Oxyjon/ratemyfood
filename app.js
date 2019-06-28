var express         = require("express"),  
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    User            = require("./models/user"),
    passport        = require("passport"),
    methodOverride  = require("method-override"),
    LocalStrategy   = require("passport-local"),
    app             = express();
    require('dotenv').config();
    

  var profileRoute = require("./routes/profile");
  var reviewRoutes = require("./routes/reviews");
  var indexRoute = require("./routes/index");
  var plateRoute = require("./routes/plate");

mongoose.connect("mongodb://localhost/ratemyfood", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");

//PASSPORT CONFIN
app.use(require("express-session")({
  secret: "This is the secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoute);
app.use("/profile", profileRoute);
app.use("/plate", plateRoute);
app.use("/plate/:id/reviews", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("App has started");
});

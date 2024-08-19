//required packages for the resful apis
const express = require('express');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// importing routes
const campgroundsRoutes = require("./routes/campgrounds");
const reveiwsRoutes = require("./routes/reviews");
const usersRoutes = require('./routes/users');
// server side 
const ExpressError = require('./utils/ExpressError');

// setting up the mongo instance.
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

//setting up express view engine to ejs.
const app = express();
app.engine('ejs',ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

//setting up the middleware.
app.use(express.urlencoded({extended: true}));
//for override the post req from the html forms.
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

// setting the express-session.
const sessionConfig = {
    secret: 'oli0.0',
    resave: false,
    saveUninitialized: true,
    cookie: {
        HttpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

//for passport.js auth
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//setting up a static port.
const port = 8080;

app.use((req, res , next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}) 


// setting up the routes.
app.use('/', usersRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reveiwsRoutes);


// the home page.
app.get("/",(req,res)=>{
    res.render("home");
});


//handling the not found error.
app.all('*',(req,res,next) => {
    next(new ExpressError('Page Not Found',404));
})

// a generic error handling middleware.
app.use((err,req,res,next) =>{
    const {statusCode=500} = err;
    if (!err.message) err.message = 'oh no, something went Wrong.';
    res.status(statusCode).render('error',{err});
})

app.listen(port,()=>{
    console.log(`listening at port ${port}!`)
});

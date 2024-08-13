//required packages for the resful apis
const express = require('express');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

//packages for handling errors.
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');


// setting up the mongo instance.
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require("./models/review");

const { deserialize } = require('v8');
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
app.use(methodOverride('_method'));

//defining a middleware for sever side validation.
const validateCampground = (req,res,next) => {
    
    // validate using the mongo schema.
    const {error} = campgroundSchema.validate(req.body);

    if (error){
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
    
}

const validateReview = (req,res, next) => {
    const {error} = reviewSchema.validate(req.body);

    if (error){
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

//setting up a statci port.
const port = 8080;

// the resful apis(routes).
app.get("/",(req,res)=>{
    res.render("home");
});

//handling the get request to get all the campgrounds info.
app.get('/campgrounds', async (req, res) => {
    //load all the data from the mongo campgrounds collectiton.
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

// handling the post request to create and add the campground to the db.
app.post('/campgrounds', validateCampground, catchAsync( async (req, res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);    
}));


// handling the get request for the create camp ground form page.
app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));

// handling the get request to display the details for a given campground.
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show',{campground});
}))

// handling the get request to display the edit form to edit the campground info.
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}))

// handling the put request to update the campground.
app.put('/campgrounds/:id',validateCampground, (async (req, res) => {
    const { id } = req.params;
    const newCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

// handling the delete request to delete a campground instance.
app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');    
}))

// ----------------------------the apis for reviews --------------------------------------------
app.post("/campgrounds/:id/reviews", validateReview ,catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review); 

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);

}));

// deleting a review
app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;
    Campground.findByIdAndUpdate(id,{
        $pull: {reviews: reviewId}
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);

}))

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

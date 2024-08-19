const express = require('express');

const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const {campgroundSchema} = require('../schemas')
const {isLoggedIn} = require('../middleware');

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

//handling the get request to get all the campgrounds info.
router.get('', async (req, res) => {
    //load all the data from the mongo campgrounds collectiton.
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

// handling the post request to create and add the campground to the db.
router.post('',isLoggedIn, validateCampground, catchAsync( async (req, res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);    
}));


// handling the get request for the create camp ground form page.
router.get('/new', isLoggedIn,catchAsync(async (req, res) => {

    res.render('campgrounds/new');
}));

// handling the get request to display the details for a given campground.
router.get('/:id',catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error','Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}))

// handling the get request to display the edit form to edit the campground info.
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}))

// handling the put request to update the campground.
router.put('/:id',isLoggedIn,validateCampground, (async (req, res) => {
    const { id } = req.params;
    const newCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground');
    res.redirect(`campgrounds/${newCampground._id}`);
}))

// handling the delete request to delete a campground instance.
router.delete('/:id',isLoggedIn, catchAsync(async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground.');
    res.redirect('/campgrounds');    
}))

module.exports = router;
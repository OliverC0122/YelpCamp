// for express routers.
const express = require('express');
const router = express.Router({mergeParams:true});

// utils for handling server side errors.
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware');

// mongo db models
const Campground = require('../models/campground');
const Review = require("../models/review");

// ----------------------------the apis for reviews --------------------------------------------
router.post("/",isLoggedIn, validateReview ,catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review); 
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash('success','Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);

}));

// deleting a review
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;
    Campground.findByIdAndUpdate(id,{
        $pull: {reviews: reviewId}
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review.')
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;
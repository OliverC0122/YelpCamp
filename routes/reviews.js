// for express routers.
const express = require('express');
const router = express.Router({mergeParams:true});

// utils for handling server side errors.
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware');


//for review controls.
const {
    createReview,
    deleteReview
} = require('../controllers/reviews');

// ----------------------------the apis for reviews --------------------------------------------
router.route("/")
    .post(isLoggedIn, validateReview ,catchAsync(createReview));

// deleting a review
router.route('/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchAsync(deleteReview))

module.exports = router;
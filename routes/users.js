// for express routers.
const express = require('express');
const router = express.Router({mergeParams:true});
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

// utils for handling server side errors.
const catchAsync = require('../utils/catchAsync');

const {
    renderRegisterForm,
    registerUser,
    renderLoginForm,
    loginUser,
    logoutUser
} = require('../controllers/users');

router.route('/register')
    .get(renderRegisterForm)
    .post(catchAsync(registerUser));

router.route('/login')
    .get(renderLoginForm)
    .post(storeReturnTo, 
        passport.authenticate('local',
        {
            failureFlash: true,
            failureRedirect: '/login',
    
        }), loginUser);


router.route('/logout').get(logoutUser);

module.exports = router;

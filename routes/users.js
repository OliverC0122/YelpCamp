// for express routers.
const express = require('express');
const router = express.Router({mergeParams:true});
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

// utils for handling server side errors.
const catchAsync = require('../utils/catchAsync');



router.get('/register',(req,res) => {
    res.render('users/register');
});

router.post('/register', catchAsync( async (req,res, next) => {

    try{
        const {username, email, password} = req.body;
        const user = new User({email,username});
        const registeredUser =  await User.register(user,password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('/register');
    }

}));

router.get('/login', (req,res) => {
    res.render('users/login');
})

router.post('/login', storeReturnTo, 
    passport.authenticate('local',
    {
        failureFlash: true,
        failureRedirect: '/login',

    } ), (req,res) => {
        req.flash('success', 'Welcome back!');
        // if the returnTo state is not get request, it will lead to a page not found error.
        const redirectUrl = res.locals.returnTo || '/campgrounds'; 
        res.redirect(redirectUrl);
});

router.get('/logout',(req,res,next)=> {
    req.logOut((err)=>
    {
        if(err) return next(err);
    });
    req.flash('success','Successfully logout!');
    res.redirect('/campgrounds');
});




module.exports = router;

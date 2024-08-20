const User = require('../models/user');
const passport = require('passport');
module.exports.renderRegisterForm = (req,res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req,res, next) => {

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

};

module.exports.renderLoginForm = (req,res) => {
    res.render('users/login');
};

module.exports.loginUser = (req,res) => {
    req.flash('success', 'Welcome back!');
    // if the returnTo state is not get request, it will lead to a page not found error.
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req,res,next)=> {
    req.logOut((err)=>
    {
        if(err) return next(err);
    });
    req.flash('success','Successfully logout!');
    res.redirect('/campgrounds');
};
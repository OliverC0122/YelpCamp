//importing the required packages
const express = require('express');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// setting up the mongo instance
const mongoose = require('mongoose');
const Campground = require('./models/campground');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

//setting up express
const app = express();
app.engine('ejs',ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

//setting up the middleware.
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


const port = 8080;

app.listen(port,()=>{
    console.log(`listening at port ${port}!`)
});

app.get("/",(req,res)=>{
    res.render("home");
});

app.get('/campgrounds', async (req, res) => {
    //load all the data from the mongo campgrounds collectiton.
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);    
})


app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show',{campground});
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const newCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${newCampground._id}`);
})

app.delete('/campgrounds/:id',async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');    
})

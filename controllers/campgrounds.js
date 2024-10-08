const Campground = require('../models/campground');

const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const {cloudinary} = require("../cloudinary");
const geocoding = require('@mapbox/mapbox-sdk/services/geocoding');


const geoCoder =  mapboxGeocoding({accessToken: mapboxToken});

module.exports.index = async (req, res) => {

    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

module.exports.renderNewForm = async (req, res) => {

    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res,next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map( (f) => ({
        url: f.path,
        filename: f.filename
    }));

    campground.author = req.user._id;
    await campground.save();

    req.flash('success','Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);    
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    .populate({
        path:'reviews',
        populate: 'author'
    })
    .populate('author');
    
    if(!campground){
        req.flash('error','Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
};

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error','cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const newCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground});

    const imgs = req.files.map( (f) => ({
        url: f.path,
        filename: f.filename
    }));
    newCampground.images.push(...imgs);

    await newCampground.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await newCampground.updateOne({ $pull: {images : {filename: { $in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.deleteCampground = async (req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if (!campground) {
        req.flash('error','cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground.');
    res.redirect('/campgrounds');    
};
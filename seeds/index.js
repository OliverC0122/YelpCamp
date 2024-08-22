// setting up the mongo instance
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
})
// make a random title name for the campground from tha hard coded data
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// make some random hard coded value for the db.
const cities = require('./cities');
const {places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// seed the db with somehow random data 0.0 .
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50;i++){
        const random1000 = Math.floor(Math.random() *1000);
        const {city, state} = cities[random1000];
        const price = Math.floor(Math.random() * 20 ) + 10;

        const camp = new Campground({
            author: '66c280345ddf28cdb1a2f8c8',
            location: `${city}, ${state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Optio, corporis quasi. Corporis maxime neque culpa. Inventore atque quod dolorum tempora alias, eveniet, cum in modi, quae corrupti illo velit ut.',
            price: price,
            images: [
                        {
                        url: 'https://res.cloudinary.com/dkzk7td8z/image/upload/v1724336399/YelpCamp/ztlk8wngzls75b1bpzbs.jpg',
                        filename: 'YelpCamp/ztlk8wngzls75b1bpzbs'
                        },
                        {
                        url: 'https://res.cloudinary.com/dkzk7td8z/image/upload/v1724336399/YelpCamp/umran7sgepbv4p6qnile.jpg',
                        filename: 'YelpCamp/umran7sgepbv4p6qnile'
                        }
                    ]
        });
        await camp.save();
    }
}

// close the db connection after save the data.
seedDB().then(() => { 
    mongoose.connection.close();
});
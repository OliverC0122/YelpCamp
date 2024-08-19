const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review')

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
    

module.exports = mongoose.model('Campground',campgroundSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review"); 

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "Price cannot be negative"],
  },
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
  type: {
    type: String,           // must be "Point"
    enum: ["Point"],
    required:true,
  },
  coordinates: {
    type: [Number],
    required:true,
  }
},
  category:{
    type:String,
    enum:["mountains","arctic","farms","deserts"],
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

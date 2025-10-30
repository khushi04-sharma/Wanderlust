const mongoose = require("mongoose");
const Listing = require("./models/listing");
const { data } = require("./init/data");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
};
const geocoder = NodeGeocoder(options);

const adminId = "68fb3c4adcb3a13359619547"; // replace with your actual admin _id

mongoose.connect(process.env.ATLASDB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const seedListings = async () => {
  await Listing.deleteMany({});
  console.log("Existing listings cleared");

  for (let listing of data) {
    // geocode the location
    const geoData = await geocoder.geocode(listing.location + ", " + listing.country);

    const newListing = new Listing({
      ...listing,
      owner: adminId,
      geometry: geoData[0] ? {
        type: "Point",
        coordinates: [geoData[0].longitude, geoData[0].latitude]
      } : null
    });

    await newListing.save();
    console.log(`Added: ${listing.title}`);
  }

  console.log("All listings seeded!");
  mongoose.connection.close();
};

seedListings();

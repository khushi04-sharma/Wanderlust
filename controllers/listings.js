const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
};
const geocoder = NodeGeocoder(options);

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  try {
    const { listing } = req.body;

    // Geocode location
    const geoData = await geocoder.geocode(listing.location);
    if (!geoData.length) {
      req.flash("error", "Invalid location!");
      return res.redirect("/listings/new");
    }

    const newListing = new Listing(listing);
    newListing.owner = req.user._id;

    // Add geometry
    newListing.geometry = {
      type: "Point",
      coordinates: [geoData[0].longitude, geoData[0].latitude],
    };

    // Add image if uploaded
    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    await newListing.save();
    req.flash("success", "Listing Added!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (e) {
    console.error(e);
    req.flash("error", "Error creating listing!");
    res.redirect("/listings/new");
  }
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image?.url || "";
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

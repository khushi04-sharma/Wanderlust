const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js"); 
const Review=require("../models/review.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");

const reviewController=require("../controllers/review.js");
const review=require("../models/review.js");

router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports=router;
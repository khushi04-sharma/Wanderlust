if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}

const express = require('express');;
const app = express();
const mongoose = require('mongoose');
//const mongo_url="mongodb://127.0.0.1:27017/wonderlust";

const dburl=process.env.ATLASDB_URL;
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js"); 
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter =require("./routes/review.js");
const userRouter=require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json()); 

main().then(()=>{
    console.log("connected to mongoDB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dburl);
}
const store=MongoStore.create({
  mongoUrl:dburl,
  crypto:{
    secret:"mysupersecretstring",
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
});


// ---------------- CSP MIDDLEWARE -----------------
//  Safer and functional CSP
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; " +
//     "connect-src 'self' https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com; " +
//     "font-src 'self' https://fonts.gstatic.com; " +
//     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; " +
//     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
//     "img-src 'self' data: blob: https://*.unsplash.com;"
//   );
//   next();
// });
// --------------------------------------------


const sessionOptions={
    store,
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
    cookie:{
      expires:Date.now()+7*24*60*60*1000,
      maxAge:1000*60*60*24*7,
      httpOnly:true,
    },
};
//console.log("Redirect URL:", req.session.redirectUrl);

// app.get("/",(req,res)=>{
//     res.send("hi,i am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"delta-student",
//   });
//   let registerUser=await User.register(fakeUser,"helloworld");
//   res.send(registerUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.all("/", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong!" } = err;
  //res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", {
  message,
  currUser: req.user // ensures navbar.ejs can access it
  });

});

// app.use((err, req, res, next) => {
//   let { statusCode = 500, message = "Something went wrong" } = err;
//   res.status(statusCode).render("error.ejs", {
//     message,
//     currUser: req.user, // important!
//     success: req.flash("success"),
//     error: req.flash("error")
//   });
// });


app.listen(8080, () => {
  console.log("server is running on port 8080");
});



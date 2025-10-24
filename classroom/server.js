const express=require("express");
const app=express();
const path = require("path");
const users=require("./routes/user.js");
const posts=require("./routes/post.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

// app.use(cookieParser());

// app.get("/getsignedcookies",(req,res)=>{
//     res.cookie("made-in","India",{signed:true});
//     res.send("signed cookie sent");
// });

// app.get("/verify",(req,res)=>{
//     console.log(req.cookies);
//     res.send("verified");
// });

// app.get("/greet",(req,res)=>{
//     let {name="anonymous"}=req.cookies;
//     res.send(`Hi,${name}`);
// });

// app.get("/",(req,res)=>{
//     res.send("Hi,I am root!");
// });

// app.use("/users",users);
// app.use("/posts",posts);

// app.use(
//     session({
//         secret:"mysupersecretstring",
//         resave:false,
//         saveUninitialized:true,
//     })
// );

// app.get("/test",(req,res)=>{
//     res.send("test successful!");
// });

// app.get("/reqcount", (req, res) => {
//     if(req.session.count) {
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`you send a request ${req.session.count} times`);
// });

const sessionOptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.successMsg=req.flash("success");
    res.locals.errorMsg=req.flash("error");
    next();
})
app.get("/register",(req,res)=>{
    let { name = "anonymous" } = req.query;
    req.session.name=name;
    //req.flash("success","user registered successfully!");
    //req.flash("error","user not registered");
    if(name === "anonymous"){
        req.flash("error","user not registered");
    }
    else{
        req.flash("success","user registered successfully!");
    }
    res.redirect("/hello");
});
app.get("/hello",(req,res)=>{
    //console.log(req.flash("success"));
    //res.send(`hello ${req.session.name}`);
    //res.locals.successMsg=req.flash("success");
    //res.locals.errorMsg=req.flash("error");
    res.render("page.ejs",{name:req.session.name});
});

app.listen(8080,()=>{
    console.log("server is listing to 8080");
});
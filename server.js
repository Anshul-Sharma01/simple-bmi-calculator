const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./schemas/userSchema.js");
const Bmi = require("./schemas/bmiSchema.js");


mongoose.connect("mongodb://localhost:27017/").then(() => {
    console.log("connected");
}).catch((err) => {
    console.log("Error occurred while connecting to the server : ",err);
})





app.use(session({
    secret : "abc@123",
    saveUninitialized:false,
    resave : true
}))
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


function authentication(req, res, next){
    if(req.session.userAuthenticated){
        next();
    }else{
        res.redirect("/login");
    }
}



function authorization(req, res, next){
    if(req.session.userAuthenticated && req.session.userData.role == "admin"){
        next();
    }else{
        res.redirect("/");
    }
}

app.get("/", authentication, (req, res) => {

    res.render("home",{userData : req.session.userData});
})


app.get("/login", (req, res) => {
    if(req.session.userAuthenticated){
        res.redirect("/");
    }else{
        res.render("login",{message:"Please Enter your credentials"});
    }
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body; 
    try{
        const userData = { username, password };
        const userExists = await User.findOne(userData);
        if(userExists){
            console.log("User found ...");
            req.session.userAuthenticated = true;
            req.session.userData = {
                username : userExists.username,
                email : userExists.email,
                age : userExists.age,
                gender : userExists.gender,
                role : userExists.role,
            };
            console.log(userExists);
            console.log(req.session.userData);
            res.redirect("/");
        }else{
            console.log("User not found, maybe wrong credentials entered...");
            const wrongPass = await User.findOne({username});
            const wrongUname = await User.findOne({password});
            if(wrongPass){
                console.log("Wrong Password Entered...");
                res.render("login",{message:"Wrong Password Entered"});
            }
            if(wrongUname){
                console.log("Wrong Username entered...");
                res.render("login",{message:"Wrong Username Entered"});
            }
            else{
                console.log("User credentials do not match..");
                console.log("User not registered.. redirecting to the signup page..");
                res.redirect("/signup");
            }
        }
    }catch(err){
        console.log("Error occurred while trying to log-In : ", err);
        res.render("login",{message:"Please Enter your credentials"});
    }
})



app.get("/signup", (req, res) => {
    if(req.session.userAuthenticated){
        res.redirect("/");
    }else{
        res.render("signup",{message:"Create new Account"});
    }
})

app.post("/signup", async (req, res) => {
    const { username, age, gender, email, password } = req.body;
    try{
        const newUserData = { username, email, password, age, gender, role:"user" };
        const userExists = await User.findOne(newUserData);
        if(userExists){
            console.log("User already exists..");
            res.render("signup",{message:"Credentials alreayd exists"});
        }else{
            const newUser = await new User(newUserData);
            await newUser.save();
            req.session.userAuthenticated = true;
            req.session.userData = {
                username,email, age, gender, role:"user"
            }
            console.log("User successfully regsitered ....");
            res.redirect("/");
        }
    }catch(err){
        console.log("Error occurred while connecting to data : ",err);
        res.redirect("/signup");
    }
})

app.get("/bmi", authentication, async (req, res) => {
    try{
        const bmiExists = await Bmi.find({email : req.session.userData.email}).lean();
        res.render("bmi",{bmiData : bmiExists});
    }catch(err){
        console.log("Error occurred while fetching the bmi data:",err);
    }
})

app.get("/calculatebmi", (req, res) => {
    res.render("calculatebmi");
})

app.post("/calculatebmi", async (req, res) => {
    const { height, weight } = req.body;
    const bmival = weight/height;
    let bmi;
    if(bmival <= 18.4){
        bmi = "Underweight";
    }else if(bmival >= 18.5 && bmival <= 24.9){
        bmi = "Normal";
    }else if(bmival >= 25.0 && bmival <= 39.9){
        bmi = "Overweight";
    }else {
        bmi = "Obese";
    }
    try{
        const bmiData = { email : req.session.userData.email, height, weight, bmi, bmivalue:bmival};
        const newBmi = await new Bmi(bmiData);
        await newBmi.save();
        console.log("New Bmi calculated");
        res.redirect("/bmi");
    }catch(err){
        console.log("Error occurred while calculating bmi..:",err);
    }
})


app.listen(3000, (err) => {
    if(err){
        console.log("Error occurred while starting the server..");
    }else{
        console.log("Server is listening at http://localhost:3000");
    }
})
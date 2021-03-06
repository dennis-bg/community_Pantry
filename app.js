var express = require("express")
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var db = mysql.createConnection({
    host: 'community-pantry.c2b5rjt4aoog.us-east-1.rds.amazonaws.com',
    user: 'senioritis',
    password: 'commpantry',
    database: 'community_pantry'
});

db.connect(function(error){
    if(error){
        console.log("Error while connecting to Database");
    }else{
        console.log("Connected to Database")
    }
});

app.use(express.static("public"));


app.get("/home", function(req, res){
    res.render("home.ejs");
});

app.get("/top10", function(req, res){
    res.render("top10.ejs");
});

app.get("/search", function(req, res){
    res.render("search.ejs");
});

app.get("/recipe/:dish", function(req, res){
    const {dish} = req.params;
    res.render("recipe.ejs", {dish});
});


app.post("/login", function(req, res){
    if(req.body.username == "admin" && req.body.pword == "admin"){
        res.render("admin.ejs");
    }
    else{
        db.query("SELECT username, pWord FROM user", function(error, rows, fields){
            var success = false;
            if(error){
                console.log(error);
            }else{
               for(var i=0; i<rows.length; i++){
                   if(rows[i].username == req.body.username){
                       console.log("username match");
                       if(rows[i].pWord == req.body.pword){
                           console.log("password match");
                           success = true;
                           res.render("home.ejs")
                       }else{
                           console.log("incorrect password");
                           success = true;
                           res.redirect("/");
                       }
                   }
               }
               if(!success)
                    res.send("No such user");
            }
        });
    }
});

app.post("/createRecipe", function(req, res){
    db.query("Insert into recipe (name, picture, cuisine, snipbit, ingredients, instructions) VALUES ('"+req.body.rName+"','"+req.body.picture+"','"+req.body.cuisine+"','"+req.body.snipbit+"', '"+req.body.ingredients+"', '"+req.body.instructions+"')",function(err, result){   
        if(err){
            res.send("Error");
        }
        else{
            res.redirect("/recipe/" + req.body.rName);
        }
    });
});

app.post("/createAccount", function(req, res){
    var valid = true;
    if(req.body.uName.length < 6){
        res.send("Username must be at least 6 characters");
        valid = false;
    }
    if(req.body.email.indexOf('@') == -1 || req.body.email.length == 0){
        res.send("Invalid email address")
        valid = false;
    }
    if(req.body.pWord.length < 6){
        res.send("Password must be at least 6 characters");
        valid = false;
    }
    if(req.body.cPword != req.body.pWord){
        res.send("Passwords are not equal")
        valid = false;
    }
    if(valid){
        db.query("Insert into user (username, email, pWord) VALUES ('"+req.body.uName+"','"+req.body.email+"','"+req.body.pWord+"')",function(err, result){   
            if(err){
                res.send("Username already exists");
            }
            else{
                res.render("home.ejs");
            }
        });
    }
});


app.get("/", function(req, res){
    res.render("index.ejs");
});


app.listen(3000, function(){
    console.log("Server running on port 3000")
});



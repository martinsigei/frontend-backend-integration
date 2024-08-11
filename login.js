const mysql=require("mysql");
const express=require("express");
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();

const app=express();
app.use("/assets",express.static("assets"));

const connection=mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '155562',
    database: 'financeapp'
});

connection.connect(function(error){
    if(error)throw error
    else console.log("connected to the database successfully")
});

app.get("/",function(req,res){
    res.sendFile(__dirname+"/public/login.html");
})

app.post("/", encoder, function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    connection.query("SELECT * FROM financeapp.users WHERE username = ? AND password = ?", [username, password], function(error, results, fields) {
        if (results.length > 0) {
            res.redirect("/public/index.html");
        } else {
            res.redirect("/");
        }
        res.end();
    });
});

app.get("/public/index",function(req,res){
    res.sendFile(__dirname+"/public/index.html")
})

app.listen(4500);
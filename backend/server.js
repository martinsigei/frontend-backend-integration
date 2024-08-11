const express=require('express');
const app=express();
const mysql=require('mysql2');
const dotenv=require('dotenv');
const cors =require('cors');
const bcrypt=require('bcrypt');
const bodyParser=require('body-parser');
const encoder=bodyParser.urlencoded();


app.use(express.json())
app.use(cors());
dotenv.config()

const financeapp=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

financeapp.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id', financeapp.threadId);

     })


     const createUssersTable=`
     CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL
        
        )`;

 financeapp.query(createUssersTable,(err,result)=>{
     if(err) console.log("error creating table")
     else{
     console.log("users table is created/checked successfully");
     }
     })

  
app.post('/register',encoder,async(req,res)=>{
    var username=req.body.username;
    var password=req.body.password;
    try{
        const users=`SELECT*FROM users WHERE email=?`;
        financeapp.query(users,[req.body.email,(err,data)=>{
            if (err) return res.status(500).json("Internal server error");
            if (data.length>0)return res.status(409).json("user already exists")
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            const newUser = `INSERT INTO user (email,username,password)VALUES(?)`
            value=[req.body.email,req.body.username,req.body.password]
            financeapp.query(newUser,[value],(err,data)=>{
                if(err) return res.status(400).json("something went wrong")

                res.status(200).json("user created successfully");
            });
        }]);
    }
    catch(err){
        res.status(500).json("Internal server Error");
    }
});

app.post('/login'),async(req,res)=>{
    try{
        const users=`SELECT*FROM users WHERE email=?`
        financeapp.query(users,[req.body.email],(err,data)=>{
            if(data.length>0){
                res.redirect("/public/index.html");
            }else{
                res.redirect("/");
            }
            res.end();
            if (err) return res.status(500).json("Internal server error");
            if(data.length===0) return res.status(404).json("user not found");

            const isPasswordValid=bcrypt.compareSync(req.body.password,data[0].password)

            if(!isPasswordValid) return res.status(400).json("Invalid password or email")

            return res.status(201).json("login successful")
        })
    }
    catch(err){
        res.status(500).json("internal server Error")
    }
};


app.get('/public/login.html',(req,res)=>{
    res.sendFile(__dirname+"/public/index.html")
});


app.listen(3000,()=>{
    console.log("server is running on PORT 3000")
});
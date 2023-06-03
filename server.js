// const express = require('express');
import express from 'express';
// const mysql = require('mysql');
import mysql from 'mysql';
// const cors = require('cors');
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        // origin: ["http://localhost:3000"],
        origin: ["https://guvi-task2.netlify.app/"],
        methods: ["POST", "GET"],
        credentials: true
    }
));
// app.use(cors());
const db = mysql.createConnection({
    host: "mysql-129792-0.cloudclusters.net",
    user: "admin",
    password: "KpZ8ijmG",
    database: "guvitask",
    port:15618,
    // connectTimeout: 200000, 
})
// var d=new Date();
// console
// db.connect();
db.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  })
// const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS users1 (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(255),
//       email VARCHAR(255)
//     )`;
// db.query(createTableQuery, (error, results) => {
//     if (error) {
//         console.error('Error creating table: ', error);
//         // return;
//     }
//     else{
//         console.log("sucess");
//     }
// });

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Message: "we need token please provide it." })
    }
    else {
        jwt.verify(token, "our-jsonwebtoken-scret-key", (err, decoded) => {
            if (err) {
                return res.json({ Meassage: "Authentication Error." })
            }
            else {
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name })
})
// import http from 'http';
// const server = http.createServer()
// server.on("request", (request, response) => {
//     // handle request based on method then URL
//     response.statusCode = 200;
//     response.write("Hello World")
//     response.end()
//     console.log("Hello");
//   })

app.post('/signup', (req, res) => {
    const sql = "INSERT INTO users (`name`,`email`,`password`) VALUES(?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ]
    // console.log(values);
    db.query(sql, [values], (err, data) => {
        // console.log(data);
        console.log(err);
        if (err) {
            return res.json("Error");
        }
        // console.log(data);
        return res.json(data);
    })

})

app.post('/profile', (req,res) =>{
    const sql = "UPDATE users SET age= ?, phone =?, qualification =?  WHERE email = ?";
    db.query(sql,[req.body.age,req.body.phone,req.body.qualification,req.body.email], (err,data)=>{
        // console.log(data);
        console.log(err);
        if (err) {
            return res.json("Error");
        }
        console.log(data);
        return res.json(data);
    
    })
    // return res;
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ? ";
    console.log(req.body);
    db.query(sql,[req.body.email, req.body.password], (err, data) => {
        console.log(data);
        console.log(err);
        if (err) {
            return res.json({ Message: "Server Side Error" });
        }
        if (data.length > 0) {
            const name = data[0].name;
            const token = jwt.sign({ name }, "our-jsonwebtoken-scret-key", { expiresIn: '1d' });
            res.cookie('token', token)
            return res.json("Success");
        }
        else {
            return res.json("Failed");
        }
    })

})

app.get('/logout', (req,res) =>{
    res.clearCookie('token');
    return res.json({Status:"Success"})
})

// console.log("hello");
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log("listening");
})
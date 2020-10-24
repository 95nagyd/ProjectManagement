require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const _ = require("underscore");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.119');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

const users = [
    {
      id: 0,
      username: 'adminuser', 
      password: 'adminuser',
      title: 'Titulus',
      lastName: 'VezetékAdmin',
      middleName: 'KözépsőAdmin',
      firstName: 'KeresztAdmin',
      role: 'admin'
    },
    {
      id: 1,
      username: 'simpleuser',
      password: 'simpleuser',
      title: '',
      lastName: 'UserVezeték',
      middleName: '',
      firstName: 'UserKereszt',
      role: 'user'
    }
]




app.get('/users', verifyToken, (req, res) => {
    res.json(users);
});

function verifyToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        console.log(req.user)
        next();
    });
}

app.listen(3000, () => {
    console.log(`Server is running on 3000`);
});
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

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if(refreshToken == null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        const accessToken = generateAccessToken(
            _.pick(user, 
                [
                    'id', 
                    'title', 
                    'lastName',
                    'middleName',
                    'firstName',
                    'role'
                ]
        ));
        res.json({ accessToken: accessToken })
    });
});

app.delete('/logout', (req, res) => {
    console.log(refreshTokens)
    refreshTokens = refreshTokens.filter(refreskToken => refreskToken != req.body.refreshToken);
    console.log(refreshTokens)
    res.sendStatus(204);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    let user = users.find((x) => {
        if(x.username == username && x.password == password) return x;
    })
    if(user == null) res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);

    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});


function generateAccessToken(user) {
    return jwt.sign(
        _.pick(user, [
            'id', 
            'title', 
            'lastName',
            'middleName',
            'firstName',
            'role'
        ]), 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 1200 }
    );
}

app.listen(4000, () => {
    console.log(`Authentication server is running on 4000`);
});
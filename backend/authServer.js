require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const _ = require("underscore");

const app = express();

const userService = require('./Services/userService');

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

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if(refreshToken == null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        const accessToken = generateAccessToken(
            _.pick(user, 
                [
                    '_id', 
                    'title', 
                    'lastName',
                    'middleName',
                    'firstName',
                    'role'
                ]
            )
        );
        res.status(200).json({ accessToken: accessToken });
    });
});

app.delete('/logout', (req, res) => {
    console.log(refreshTokens)
    refreshTokens = refreshTokens.filter(refreskToken => refreskToken != req.body.refreshToken);
    console.log(refreshTokens)
    return res.sendStatus(204);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    userService.getUsers({ username: username, password: password }).then((users) => {
        console.log(users)
        if(users.length == 0) res.status(401).json({ message: "Hibás felhasználónév vagy jelszó!" });

        const user = users[0];
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

        refreshTokens.push(refreshToken);

        res.json({ accessToken: accessToken, refreshToken: refreshToken });
    }, (error) => {
        console.log(error)
        res.status(401).json({ message: "Adatbázis hiba!" });
    });
});


function generateAccessToken(user) {
    return jwt.sign(
        _.pick(user, [
            '_id', 
            'title', 
            'lastName',
            'middleName',
            'firstName',
            'role'
        ]), 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 5 }
    );
}

app.listen(4000, () => {
    console.log(`Authentication server is running on 4000`);
});
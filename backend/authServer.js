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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken || !jwt.decode(refreshToken).username) return res.status(401).json({ message: "Azonosítási hiba.\nFolytatáshoz jelentkezzen be újra." });
    const username = jwt.decode(refreshToken).username;
    return userService.getUsers({ username: username }).then(async (users) => {
        if (users.length !== 1) return res.status(401).json({ message: "Azonosítási hiba.\nFolytatáshoz jelentkezzen be újra." });
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET + users[0].password + users[0].role;
        return jwt.verify(refreshToken, refreshSecret, (err, user) => {
            if (err) return res.status(406).json({ message: "A felhasználójához tartozó szerepkört, vagy jelszót módosították.\nFolytatáshoz jelentkezzen be újra." });
            if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: "Hiba történt az autentikáció frissítésekor.\nFolytatáshoz jelentkezzen be újra." });
            const accessToken = generateAccessToken(user);
            return res.status(200).json({ accessToken: accessToken });
        });
    }, (error) => {
        return res.status(500).json({ message: error });
    });
});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(refreskToken => refreskToken != req.body.refreshToken);
    return res.sendStatus(204);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    return userService.loginOrAddFirst(username, password).then((resolved) => {
        if (resolved === 201) {
            return res.status(201).json({ username: username });
        }
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET + resolved.password + resolved.role;
        delete resolved.password;

        const accessToken = generateAccessToken(resolved);
        const refreshToken = jwt.sign(resolved, refreshSecret);

        refreshTokens.push(refreshToken);
        return res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
    }, (error) => {
        if (error === 401) {
            return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó!" });
        }
        return res.status(422).json({ message: error });
    });
});


function generateAccessToken(user) {
    return jwt.sign(
        _.pick(user, [
            '_id',
            'username',
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
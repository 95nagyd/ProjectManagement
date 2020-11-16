require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const _ = require("underscore");
const argon2 = require('argon2');

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
    if(!refreshToken || !jwt.decode(refreshToken).username) return res.status(401).json({ message: "Azonosítási hiba. Folytatáshoz jelentkezzen be újra." });
    const username = jwt.decode(refreshToken).username
    return userService.getUsers({ username: username }).then(async (users) => {
        if(users.length !== 1) return res.status(401).json({ message: "Azonosítási hiba. Folytatáshoz jelentkezzen be újra." });
        
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET + users[0].password;
        return jwt.verify(refreshToken, refreshSecret, (err, user) => {
            if(err) return res.status(401).json({ message: "Azonosítási hiba. Folytatáshoz jelentkezzen be újra." });
            if(!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: "Hiba történt az autentikáció frissítésekor. Az időkeret ismételt bejelentkezésig nem fog frissülni." });
            const accessToken = generateAccessToken(user);
            return res.status(200).json({ accessToken: accessToken });
        });
    }, (error) => {
        console.log(error)
        return res.status(500).json({ message: "Adatbázis elérési hiba!" });
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
    //TODO: transaction lock
    return userService.getUsers({}).then(async (users) => {
        if(users.length === 0) {
            const firstUser = {
                username: username,
                password: password,
                title: '',
                lastName: 'Automatikusan',
                middleName: 'Hozzáadott',
                firstName: 'Felhasználó',
                role: 'admin',
                telephone: '',
                email: ''
            }
            return userService.addUser(firstUser).then(() => {
                return res.status(201).json({username: username});
            }, (error) => {
                return res.status(422).json({ message: error });
            });
        } else {
            return userService.getUsers({ username: username }).then(async (users) => {
                if(users.length !== 1) return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó!" });
        
                const isVerified = await argon2.verify(users[0].password, password + users[0].salt);

                if(!isVerified) return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó!" });

                const refreshSecret = process.env.REFRESH_TOKEN_SECRET + users[0].password;

                delete users[0].salt;
                delete users[0].password;
                const user = users[0];
                
                const accessToken = generateAccessToken(user);
                const refreshToken = jwt.sign(user, refreshSecret);
    
                refreshTokens.push(refreshToken);
    
                return res.json({ accessToken: accessToken, refreshToken: refreshToken });
        
            }, (error) => {
                console.log(error)
                return res.status(500).json({ message: "Adatbázis elérési hiba!" });
            });
        }
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
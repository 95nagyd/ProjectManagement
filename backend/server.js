require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const _ = require("underscore");

const app = express();

const userService = require('./Services/userService');
const workingTimeService = require('./Services/workingTimeService');


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




app.get('/users', verifyToken, (req, res) => {
    userService.getUsers({}).then((users) => {
        res.status(200).json(users);
    }, (error) => {
        res.status(400).json({ message: error });
    });
});


app.get('/workingTime/:period', verifyToken, (req, res) => {
    workingTimeService.getWorkingTimeByGivenUserIdAndPeriod(req.user._id, req.params.period).then((result) => {
        var workingTime = result[0] === undefined ? [] : result[0].workingTime;
        res.status(200).json(workingTime);
    }, (error) => {
        res.status(400).json({ message: error });
    });
});

app.get('/workingTime/:userId/:period', verifyToken, (req, res) => {
    workingTimeService.getWorkingTimeByGivenUserIdAndPeriod(req.params.userId, req.params.period).then((result) => {
        var workingTime = result[0] === undefined ? [] : result[0].workingTime;
        res.status(200).json(workingTime);
    }, (error) => {
        res.status(400).json({ message: error });
    });
});

app.post('/workingTime/save/:period', verifyToken, (req, res) => {
    workingTimeService.saveCurrentUserWorkingTimeByGivenPeriod(req.user._id, req.params.period, req.body.workingTime).then(() => {
        res.status(200).send();
    }, (error) => {
        res.status(422).send();
    });
});

app.get('/firstPeriod', verifyToken, (req, res) => {
    workingTimeService.getFirstSavedPeriod().then((result) => {
        var firstPeriod = result.length > 0 && result[0].firstPeriod ? result[0].firstPeriod : -1;
        res.status(200).json(firstPeriod);
    }, (error) => {
        res.status(400).json({ message: error });
    });
});




function verifyToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(3000, () => {
    console.log(`Server is running on 3000`);
});
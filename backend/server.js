require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const _ = require("underscore");

const app = express();

const userService = require('./Services/userService');
const workingTimeService = require('./Services/workingTimeService');
const basicDataService = require('./Services/basicDataService');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

//TODO: lekezelni a promise reject-eket
//TODO: returnonli az osszes res-t

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.119');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});




app.get('/users', verifyToken, (req, res) => {
    userService.getUsers({}).then((users) => {
        users.forEach((user) => {
            delete user.salt;
            delete user.password;
        });
        return res.status(200).json(users);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.post('/saveUser', verifyToken, (req, res) => {
    console.log(req.body.user)
    if(req.body.user._id === '-1'){
        userService.addUser(req.body.user).then(() => {
            return res.status(201).send();
        }, (error) => {
            return res.status(422).send({ message: error });
        });
    } else {
        userService.saveUser(req.body.user).then(() => {
            return res.status(201).send();
        }, (error) => {
            return res.status(422).send({ message: error });
        });
    }
});


app.get('/workingTime/:period', verifyToken, (req, res) => {
    workingTimeService.getWorkingTimeByGivenUserIdAndPeriod(req.user._id, req.params.period).then((result) => {
        var workingTime = result[0] === undefined ? [] : result[0].workingTime;
        return res.status(200).json(workingTime);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.get('/workingTime/:userId/:period', verifyToken, (req, res) => {
    workingTimeService.getWorkingTimeByGivenUserIdAndPeriod(req.params.userId, req.params.period).then((result) => {
        var workingTime = result[0] === undefined ? [] : result[0].workingTime;
        return res.status(200).json(workingTime);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.post('/workingTime/save/:period', verifyToken, (req, res) => {
    workingTimeService.saveCurrentUserWorkingTimeByGivenPeriod(req.user._id, req.params.period, req.body.workingTime).then(() => {
        return res.status(201).send();
    }, (error) => {
        if(error === 400){
            return res.status(400).send({ message: "A a mentésre kerülő elemek közül időközben néhányat töröltek.\nMentés előtt javítsa a hibás mezőket!" })
        }
        return res.status(422).send({ message: error });
    });
});

app.get('/firstPeriod', verifyToken, (req, res) => {
    workingTimeService.getFirstSavedPeriod().then((result) => {
        var firstPeriod = result.length > 0 && result[0].firstPeriod ? result[0].firstPeriod : -1;
        return res.status(200).json(firstPeriod);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.get('/basicData/all', verifyToken, (req, res) => {
    basicDataService.getBasicData().then((projects) => {
        return res.status(200).json(projects);
    }, (error) => {
        console.log(error)
        return res.status(400).json({ message: error });
    });
});

app.get('/basicData/projects', verifyToken, (req, res) => {
    basicDataService.getProjects({}).then((projects) => {
        return res.status(200).json(projects);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.get('/basicData/designPhases', verifyToken, (req, res) => {
    basicDataService.getDesignPhases({}).then((projects) => {
        return res.status(200).json(projects);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.get('/basicData/structuralElements', verifyToken, (req, res) => {
    basicDataService.getStructuralElements({}).then((projects) => {
        return res.status(200).json(projects);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});

app.get('/basicData/subtasks', verifyToken, (req, res) => {
    basicDataService.getSubtasks({}).then((projects) => {
        return res.status(200).json(projects);
    }, (error) => {
        return res.status(400).json({ message: error });
    });
});





function verifyToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.status(401).json({ message: "Azonosítási hiba. Folytatáshoz jelentkezzen be újra." });
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(401).json({ message: "Azonosítási hiba. Folytatáshoz jelentkezzen be újra." });
        return userService.getUsers({ username: user.username }).then(async (users) => {
            if(users.length !== 1) return res.status(401).json({ message: "Azonosítási hiba. Folytatáshoz jelentkezzen be újra." });
            req.user = user;
            return next();
        }, (error) => {
            return res.status(500).json({ message: "Adatbázis elérési hiba!" });
        });
    });
}

app.listen(3000, () => {
    console.log(`Server is running on 3000`);
});
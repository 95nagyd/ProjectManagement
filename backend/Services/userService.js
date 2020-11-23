require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;
const mongoService = require('./mongoService');
const _ = require("underscore");
const randomstring = require("randomstring");
const argon2 = require('argon2');


async function getUsers(query) {
    return await mongoService.find('users', query, {});
}

async function saveUser(user){
    //TODO: debugba kiprobalni, hogy mi lesz
    let saveData = _.pick(user, 
        [
            'password',
            'title', 
            'lastName',
            'middleName',
            'firstName',
            'role',
            'telephone',
            'email'
        ]
    )
    if(saveData.password === '') { 
        delete saveData.password; 
    } else {
        const newRandomSalt = randomstring.generate(10);
        const newHashedPassword = await argon2.hash(saveData.password + newRandomSalt);
        saveData.password = newHashedPassword;
        saveData.salt = newRandomSalt;
    }
    return await mongoService.update('users', {_id: new ObjectId(user._id)}, { $set: saveData });
}

async function addUser(user){
    delete user._id;
    const randomSalt = randomstring.generate(10);
    const hashedPassword = await argon2.hash(user.password + randomSalt);
    user.password = hashedPassword;
    user.salt = randomSalt;
    return await mongoService.insert('users', user);
}


async function loginOrAddFirst(username, password){
    return await new Promise((resolve, reject) => {
        MongoClient.connect(process.env.URL, { useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.log('DB Connection Error: ' + err);
                return reject(err);
            } else {
                var db = client.db(process.env.DBNAME);
                db.collection('users').find({}, {}).toArray( async (foundErr, users) => {
                    if (foundErr) {
                        client.close();
                        reject(foundErr);
                    } else {
                        if (users.length === 0) {
                            let firstUser = {
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
                            const randomSalt = randomstring.generate(10);
                            const hashedPassword = await argon2.hash(firstUser.password + randomSalt);
                            firstUser.password = hashedPassword;
                            firstUser.salt = randomSalt;

                            db.collection('users').insertOne(firstUser, (foundErr) => {
                                if (foundErr) {
                                    client.close();
                                    return reject(foundErr);
                                } else {
                                    client.close();
                                    return resolve(201);
                                }
                            });
                        } else {
                            if (users.filter((user) => { return user.username === username }).length !== 1) { 
                                client.close();
                                return reject(401); 
                            }

                            let actualUser = users.filter((user) => { return user.username === username })[0]
                
                            const isVerified = await argon2.verify(actualUser.password, password + actualUser.salt);
            
                            if (!isVerified) { 
                                client.close();
                                return reject(401); 
                            }

                            delete actualUser.salt;
                            

                            client.close();
                            return resolve(actualUser);
                        }
                    }
                });
            }
        });
    });
}

module.exports = {
    getUsers: getUsers,
    saveUser: saveUser,
    addUser: addUser,
    loginOrAddFirst: loginOrAddFirst
}
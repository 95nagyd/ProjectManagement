require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;
const mongoService = require('./mongoService');
const _ = require("underscore");


async function getBasicElementsByType(type){
    return await mongoService.find(type, {}, {});
}

async function addBasicElementByType(basicElement, type){
    delete basicElement._id;
    return await mongoService.insert(type, basicElement);
    
}

async function saveBasicElementByType(basicElement, type){
    return await mongoService.update(type, {_id: new ObjectId(basicElement._id)}, { $set: {name: basicElement.name} });
}


async function getBasicData() {
    return await new Promise((resolve, reject) => {
        MongoClient.connect(process.env.URL, { useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.log('DB Connection Error: ' + err);
                return reject(err);
            } else {
                var db = client.db(process.env.DBNAME);

                var basicData = {};

                db.collection('projects').find({}, {}).toArray((foundErr, projects) => {
                    if (foundErr) {
                        client.close();
                        return reject(foundErr);
                    } else {
                        basicData.projects = projects;
                        db.collection('designPhases').find({}, {}).toArray((foundErr, designPhases) => {
                            if (foundErr) {
                                client.close();
                                return reject(foundErr);
                            } else {
                                basicData.designPhases = designPhases;
                                db.collection('structuralElements').find({}, {}).toArray((foundErr, structuralElements) => {
                                    if (foundErr) {
                                        client.close();
                                        return reject(foundErr);
                                    } else {
                                        basicData.structuralElements = structuralElements;
                                        db.collection('subtasks').find({}, {}).toArray((foundErr, subtasks) => {
                                            if (foundErr) {
                                                client.close();
                                                return reject(foundErr);
                                            } else {
                                                basicData.subtasks = subtasks;
                                                client.close();
                                                return resolve(basicData);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}


module.exports = {
    getBasicElementsByType: getBasicElementsByType,
    getBasicData : getBasicData,
    addBasicElementByType: addBasicElementByType,
    saveBasicElementByType: saveBasicElementByType
}
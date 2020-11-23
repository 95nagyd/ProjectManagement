require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;
const mongoService = require('./mongoService');
const _ = require("underscore");

//TODO:!!! nem kell else a founderr-ek után

async function getBasicElementsByType(type) {
    return await mongoService.find(type, {}, {});
}

async function addBasicElementByType(basicElement, type) {
    delete basicElement._id;
    return await mongoService.insert(type, basicElement);
}

async function saveBasicElementByType(basicElement, type) {
    return await mongoService.update(type, { _id: new ObjectId(basicElement._id) }, { $set: { name: basicElement.name } });
}

async function deleteBasicElementByType(basicElementId, type) {
    return await new Promise((resolve, reject) => {
        MongoClient.connect(process.env.URL, { useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.log('DB Connection Error: ' + err);
                return reject(err);
            } else {
                var db = client.db(process.env.DBNAME);

                const getUsedIdListPipeline =
                    [
                        {
                            $unwind: {
                                path: "$workingTime",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                        {
                            $unwind: {
                                path: "$workingTime",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                projectId: "$workingTime.projectId",
                                designPhaseId: "$workingTime.designPhaseId",
                                structuralElementId: {
                                    $cond: {
                                        if: {
                                            $ne: ["$workingTime.structuralElementId", ""]
                                        },
                                        then: "$workingTime.structuralElementId",
                                        else: "$$REMOVE"
                                    }
                                },
                                subtaskId: {
                                    $cond: {
                                        if: { $ne: ["$workingTime.subtaskId", ""] },
                                        then: "$workingTime.subtaskId",
                                        else: "$$REMOVE"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "usedBasicElementIdList",
                                projectIdList: {
                                    $push: "$projectId"
                                },
                                designPhaseIdList: {
                                    $push: "$designPhaseId"
                                },
                                structuralElementIdList: {
                                    $push: "$structuralElementId"
                                },
                                subtaskIdList: {
                                    $push: "$subtaskId"
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                usedIdList: {
                                    "$setUnion": [
                                        "$projectIdList",
                                        "$designPhaseIdList",
                                        "$structuralElementIdList",
                                        "$subtaskIdList"
                                    ]
                                }
                            }
                        }
                    ]

                db.collection('workingTimes').aggregate(getUsedIdListPipeline).toArray((foundErr, result) => {
                    if (foundErr) {
                        client.close();
                        return reject(foundErr);
                    } else {
                        if(result.length > 1) { return reject('Sikertelen törlés.\nNem sikerült lekérdezni a használatban lévő elemeket.'); }

                        if (result.length > 0 && result[0].usedIdList.indexOf(basicElementId) !== -1) {
                            client.close();
                            return reject(409);
                        }
                        db.collection(type).deleteOne({ _id: new ObjectId(basicElementId) }, (foundErr, collection) => {
                            if (foundErr) {
                                client.close();
                                return reject(foundErr);
                            } else {
                                client.close();
                                return resolve();
                            }
                        });
                    }
                });
            }
        });
    });
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
    getBasicData: getBasicData,
    addBasicElementByType: addBasicElementByType,
    saveBasicElementByType: saveBasicElementByType,
    deleteBasicElementByType: deleteBasicElementByType
}
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
                        $project: {
                            _id: 0,
                            periodData: 1
                        }
                    },
                    {
                        $group: {
                            _id: "dayLists",
                            day01List: {
                                $push: "$periodData.0"
                            },
                            day02List: {
                                $push: "$periodData.1"
                            },
                            day03List: {
                                $push: "$periodData.2"
                            },
                            day04List: {
                                $push: "$periodData.3"
                            },
                            day05List: {
                                $push: "$periodData.4"
                            },
                            day06List: {
                                $push: "$periodData.5"
                            },
                            day07List: {
                                $push: "$periodData.6"
                            },
                            day08List: {
                                $push: "$periodData.7"
                            },
                            day09List: {
                                $push: "$periodData.8"
                            },
                            day10List: {
                                $push: "$periodData.9"
                            },
                            day11List: {
                                $push: "$periodData.10"
                            },
                            day12List: {
                                $push: "$periodData.11"
                            },
                            day13List: {
                                $push: "$periodData.12"
                            },
                            day14List: {
                                $push: "$periodData.13"
                            },
                            day15List: {
                                $push: "$periodData.14"
                            },
                            day16List: {
                                $push: "$periodData.15"
                            },
                            day17List: {
                                $push: "$periodData.16"
                            },
                            day18List: {
                                $push: "$periodData.17"
                            },
                            day19List: {
                                $push: "$periodData.18"
                            },
                            day20List: {
                                $push: "$periodData.19"
                            },
                            day21List: {
                                $push: "$periodData.20"
                            },
                            day22List: {
                                $push: "$periodData.21"
                            },
                            day23List: {
                                $push: "$periodData.22"
                            },
                            day24List: {
                                $push: "$periodData.23"
                            },
                            day25List: {
                                $push: "$periodData.24"
                            },
                            day26List: {
                                $push: "$periodData.25"
                            },
                            day27List: {
                                $push: "$periodData.26"
                            },
                            day28List: {
                                $push: "$periodData.27"
                            },
                            day29List: {
                                $push: "$periodData.28"
                            },
                            day30List: {
                                $push: "$periodData.29"
                            },
                            day31List: {
                                $push: "$periodData.30"
                            }
                        }
                    },
                    {
                        $project: { 
                            _id:0,
                            dayDataList: { 
                                "$setUnion": [
                                    "$day01List",
                                    "$day02List",
                                    "$day03List",
                                    "$day04List",
                                    "$day05List",
                                    "$day06List",
                                    "$day07List",
                                    "$day08List",
                                    "$day09List",
                                    "$day10List",
                                    "$day11List",
                                    "$day12List",
                                    "$day13List",
                                    "$day14List",
                                    "$day15List",
                                    "$day16List",
                                    "$day17List",
                                    "$day18List",
                                    "$day19List",
                                    "$day20List",
                                    "$day21List",
                                    "$day22List",
                                    "$day23List",
                                    "$day24List",
                                    "$day25List",
                                    "$day26List",
                                    "$day27List",
                                    "$day28List",
                                    "$day29List",
                                    "$day30List",
                                    "$day31List"
                                ] 
                            }
                        }
                    },
                    {
                        $unwind:
                            {
                                path: "$dayDataList",
                                preserveNullAndEmptyArrays: false
                            }
                    },
                    {
                        $unwind:
                            {
                                path: "$dayDataList",
                                preserveNullAndEmptyArrays: false
                            }
                    },
                    {
                         $project: {
                            projectId: "$dayDataList.projectId",
                            designPhaseId: "$dayDataList.designPhaseId",
                            structuralElementId: {
                                $cond: {
                                    if: { $ne: ["$dayDataList.structuralElementId", ""] },
                                    then: "$dayDataList.structuralElementId",
                                    else: "$$REMOVE"
                                }
                            },
                            subtaskId: {
                                $cond: {
                                    if: { $ne: ["$dayDataList.subtaskId", ""] },
                                    then: "$dayDataList.subtaskId",
                                    else: "$$REMOVE"
                                }
                            }
                         }
                    },
                    {
                        $group: {
                            _id: "usedBasicElementIdList",
                            projectIdList:{
                                $push: "$projectId"
                            },
                            designPhaseIdList:{
                                $push: "$designPhaseId"
                            },
                            structuralElementIdList:{
                                $push: "$structuralElementId"
                            },
                            subtaskIdList:{
                                $push: "$subtaskId"
                            }
                        }
                    },
                    {
                        $project: { 
                            _id:0,
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
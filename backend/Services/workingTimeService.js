require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;
const mongoService = require('./mongoService');
const _ = require("underscore");


async function getWorkingTimeByGivenUserIdAndPeriod(userId, period) {
    return await mongoService.find('workingTimes', { userId: new ObjectId(userId), period:period}, { projection: { _id:0, workingTime:1 }});
}

async function saveCurrentUserWorkingTimeByGivenPeriod(userId, period, workingTime) {
    return await new Promise((resolve, reject) => {
        MongoClient.connect(process.env.URL, { useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.log('DB Connection Error: ' + err);
                return reject(err);
            } else {

                var projectIdList = [];
                var designPhaseIdList = [];
                var structuralElementIdList = [];
                var subtaskIdList = [];

                workingTime.filter(hasValues => {
                    return hasValues;
                }).forEach(element => {
                    element.forEach(innerElement => {
                        if (!!innerElement.projectId) {
                            const idObject = { _id: new ObjectId(innerElement.projectId) }
                            if (projectIdList.findIndex(projectId => projectId._id.equals(idObject._id)) === -1) {
                                projectIdList.push(idObject)
                            }
                        }
                        if (!!innerElement.designPhaseId) {
                            const idObject = { _id: new ObjectId(innerElement.designPhaseId) }
                            if (designPhaseIdList.findIndex(designPhaseId => designPhaseId._id.equals(idObject._id)) === -1) {
                                designPhaseIdList.push(idObject)
                            }
                        }
                        if (!!innerElement.structuralElementId) {
                            const idObject = { _id: new ObjectId(innerElement.structuralElementId) }
                            if (structuralElementIdList.findIndex(structuralElementId => structuralElementId._id.equals(idObject._id)) === -1) {
                                structuralElementIdList.push(idObject)
                            }
                        }
                        if (!!innerElement.subtaskId) {
                            const idObject = { _id: new ObjectId(innerElement.subtaskId) }
                            if (subtaskIdList.findIndex(subtaskId => subtaskId._id.equals(idObject._id)) === -1) {
                                subtaskIdList.push(idObject)
                            }
                        }
                    });
                });

                structuralElementIdList = structuralElementIdList.length > 0 ? structuralElementIdList : [{ _id: null }];
                subtaskIdList = subtaskIdList.length > 0 ? subtaskIdList : [{ _id: null }];

                var db = client.db(process.env.DBNAME);

                db.collection('projects').find({ $or: projectIdList }).toArray((foundErr, projects) => {
                    if (foundErr) {
                        client.close();
                        return reject(foundErr);
                    } else {
                        if (projectIdList.length !== projects.length) {
                            client.close();
                            return reject(404);
                        }
                        db.collection('designPhases').find({ $or: designPhaseIdList }).toArray((foundErr, designPhases) => {
                            if (foundErr) {
                                client.close();
                                return reject(foundErr);
                            } else {
                                if (designPhaseIdList.length !== designPhases.length) {
                                    client.close();
                                    return reject(404);
                                }
                                db.collection('structuralElements').find({ $or: structuralElementIdList }).toArray((foundErr, structuralElements) => {
                                    if (foundErr) {
                                        client.close();
                                        return reject(foundErr);
                                    } else {
                                        if (structuralElementIdList.filter(structuralElementId => structuralElementId._id !== null).length !== structuralElements.length) {
                                            client.close();
                                            return reject(404);
                                        }
                                        db.collection('subtasks').find({ $or: subtaskIdList }).toArray((foundErr, subtasks) => {
                                            if (foundErr) {
                                                client.close();
                                                return reject(foundErr);
                                            } else {
                                                if (subtaskIdList.filter(subtaskId => subtaskId._id !== null).length !== subtasks.length) {
                                                    client.close();
                                                    return reject(404);
                                                }
                                                db.collection('workingTimes').updateOne({ userId: new ObjectId(userId), period: period }, { $set: { workingTime: workingTime } }, { upsert: true }, (foundErr, collection) => {
                                                    if (foundErr) {
                                                        client.close();
                                                        return reject(foundErr);
                                                    } else if (collection.matchedCount === 0 && collection.modifiedCount === 0 && collection.upsertedId === null) {
                                                        client.close();
                                                        return reject(404);
                                                    } else {
                                                        client.close();
                                                        return resolve();
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
            }
        });
    });
}

async function getFirstSavedPeriod(){
    return await mongoService.aggregate('workingTimes', [{$group:{_id:{}, firstPeriod: {$min: "$period"}}}]);
    
}

module.exports = {
    getWorkingTimeByGivenUserIdAndPeriod: getWorkingTimeByGivenUserIdAndPeriod,
    saveCurrentUserWorkingTimeByGivenPeriod: saveCurrentUserWorkingTimeByGivenPeriod,
    getFirstSavedPeriod: getFirstSavedPeriod
}
require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;
const mongoService = require('./mongoService');
const _ = require("underscore");
const { isNull } = require('underscore');


async function getWorkingTimeByGivenUserIdAndPeriod(userId, period) {
    return await mongoService.find('workingTimes', { userId: new ObjectId(userId), period: period }, { projection: { _id: 0, periodData: 1 } });
}

async function saveCurrentUserWorkingTimeByGivenPeriod(userId, period, periodData) {
    return await new Promise((resolve, reject) => {
        MongoClient.connect(process.env.URL, { useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.log('DB Connection Error: ' + err);
                return reject(err);
            } else {

                console.log(periodData)
                if (periodData.length === 0) {
                    var db = client.db(process.env.DBNAME);

                    return db.collection('workingTimes').deleteOne({ userId: new ObjectId(userId), period: period }, (foundErr, collection) => {
                        if (foundErr) {
                            client.close();
                            return reject(foundErr);
                        } else {
                            client.close();
                            return resolve();
                        }
                    });
                }

                var projectIdList = [];
                var designPhaseIdList = [];
                var structuralElementIdList = [];
                var subtaskIdList = [];

                for (let dayIndex in periodData) {
                    const element = periodData[dayIndex];

                    element.forEach(innerElement => {
                        if (innerElement.projectId.length !== 0) {
                            const projectIdObject = { _id: new ObjectId(innerElement.projectId) }
                            if (projectIdList.findIndex(projectId => projectId._id.equals(projectIdObject._id)) === -1) {
                                projectIdList.push(projectIdObject);
                            }
                        }
                        if (innerElement.designPhaseId.length !== 0) {
                            const designPhaseIdObject = { _id: new ObjectId(innerElement.designPhaseId) }
                            if (designPhaseIdList.findIndex(designPhaseId => designPhaseId._id.equals(designPhaseIdObject._id)) === -1) {
                                designPhaseIdList.push(designPhaseIdObject);
                            }
                        }
                        if (innerElement.structuralElementId.length !== 0) {
                            const structuralElementIdObject = { _id: new ObjectId(innerElement.structuralElementId) }
                            if (structuralElementIdList.findIndex(structuralElementId => structuralElementId._id.equals(structuralElementIdObject._id)) === -1) {
                                structuralElementIdList.push(structuralElementIdObject);
                            }
                        }
                        if (innerElement.subtaskId.length !== 0) {
                            const subtaskIdObject = { _id: new ObjectId(innerElement.subtaskId) }
                            if (subtaskIdList.findIndex(subtaskId => subtaskId._id.equals(subtaskIdObject._id)) === -1) {
                                subtaskIdList.push(subtaskIdObject);
                            }
                        }
                    });
                }

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
                                                db.collection('workingTimes').updateOne({ userId: new ObjectId(userId), period: period }, { $set: { periodData: periodData } }, { upsert: true }, (foundErr, collection) => {
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

async function getFirstSavedPeriod() {
    return await mongoService.aggregate('workingTimes', [{ $group: { _id: {}, firstPeriod: { $min: "$period" } } }]);

}

module.exports = {
    getWorkingTimeByGivenUserIdAndPeriod: getWorkingTimeByGivenUserIdAndPeriod,
    saveCurrentUserWorkingTimeByGivenPeriod: saveCurrentUserWorkingTimeByGivenPeriod,
    getFirstSavedPeriod: getFirstSavedPeriod
}
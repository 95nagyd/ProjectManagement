const { DBNAME, URL } = require('../dbConfig');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;


class MongoService {
    constructor(dbName, url){
        this.url = url;
        this.dbName = dbName;
    }

    //TODO: withtransaction

    find(collectionName, query, options) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);
                    db.collection(collectionName).find(query, options).toArray((foundErr, result) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else {
                            client.close(); 
                            resolve(result);
                        }
                    });
                }
            });
        });
    }

    update(collectionName, filter, update, options) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);
                    
                    db.collection(collectionName).updateOne(filter, update, options, (foundErr, collection) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else if(collection.modifiedCount === 0 && collection.upsertedId === null) {
                            client.close(); 
                            reject('Nem sikerült módosítás!');
                        } else {
                            client.close(); 
                            resolve();
                        }
                    });
                }
            });
        });
    }

    aggregate(collectionName, pipeline) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);
                    db.collection(collectionName).aggregate(pipeline).toArray((foundErr, aggregated) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else {
                            client.close(); 
                            resolve(aggregated);
                        }
                    });
                }
            });
        });
    }

    insert(collectionName, entry) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);

                    db.collection(collectionName).insertOne(entry, (foundErr, collection) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else {
                            client.close(); 
                            resolve();
                        }
                    });
                }
            });
        });
    }

    





    /* speciális */
    getBasicData() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);

                    var basicData = {};
                    
                    db.collection('projects').find({}, {}).toArray((foundErr, projects) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else {
                            basicData.projects = projects;
                            db.collection('designPhases').find({}, {}).toArray((foundErr, designPhases) => {
                                if(foundErr){
                                    client.close(); 
                                    reject(foundErr);
                                } else {
                                    basicData.designPhases = designPhases;
                                    db.collection('structuralElements').find({}, {}).toArray((foundErr, structuralElements) => {
                                        if(foundErr){
                                            client.close(); 
                                            reject(foundErr);
                                        } else {
                                            basicData.structuralElements = structuralElements;
                                            db.collection('subtasks').find({}, {}).toArray((foundErr, subtasks) => {
                                                if(foundErr){
                                                    client.close(); 
                                                    reject(foundErr);
                                                } else {
                                                    basicData.subtasks = subtasks;
                                                    client.close(); 
                                                    resolve(basicData);
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


    saveWorkingTime(userId, period, workingTime) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    
                    var projectIdList = [];
                    var designPhaseIdList = [];
                    var structuralElementIdList = [];
                    var subtaskIdList = [];

                    workingTime.filter(hasValues => {
                        return hasValues;
                    }).forEach(element => {
                        element.forEach(innerElement => {
                            if(!!innerElement.projectId) { 
                                const idObject = {_id: new ObjectId(innerElement.projectId)}
                                if(projectIdList.findIndex(projectId => projectId._id.equals(idObject._id)) === -1){
                                    projectIdList.push(idObject)
                                }
                            }
                            if(!!innerElement.designPhaseId) { 
                                const idObject = {_id: new ObjectId(innerElement.designPhaseId)}
                                if(designPhaseIdList.findIndex(designPhaseId => designPhaseId._id.equals(idObject._id)) === -1){
                                    designPhaseIdList.push(idObject)
                                }
                            }
                            if(!!innerElement.structuralElementId) { 
                                const idObject = {_id: new ObjectId(innerElement.structuralElementId)}
                                if(structuralElementIdList.findIndex(structuralElementId => structuralElementId._id.equals(idObject._id)) === -1){
                                    structuralElementIdList.push(idObject)
                                }
                            }
                            if(!!innerElement.subtaskId) { 
                                const idObject = {_id: new ObjectId(innerElement.subtaskId)}
                                if(subtaskIdList.findIndex(subtaskId => subtaskId._id.equals(idObject._id)) === -1){
                                    subtaskIdList.push(idObject)
                                }
                            }
                        });
                    });

                    structuralElementIdList = structuralElementIdList.length > 0 ? structuralElementIdList : [{_id:null}];
                    subtaskIdList = subtaskIdList.length > 0 ? subtaskIdList : [{_id:null}];
                    
                    var db = client.db(this.dbName);

                    db.collection('projects').find({$or:projectIdList}).toArray((foundErr, projects) => {
                        if(foundErr){
                            client.close(); 
                            return reject(foundErr);
                        } else {
                            if(projectIdList.length !== projects.length) { 
                                return reject(400); 
                            }
                            db.collection('designPhases').find({$or:designPhaseIdList}).toArray((foundErr, designPhases) => {
                                if(foundErr){
                                    client.close(); 
                                    return reject(foundErr);
                                } else {
                                    if(designPhaseIdList.length !== designPhases.length) { 
                                        client.close(); 
                                        return reject(400); 
                                    }
                                    db.collection('structuralElements').find({$or:structuralElementIdList}).toArray((foundErr, structuralElements) => {
                                        if(foundErr){
                                            client.close(); 
                                            return reject(foundErr);
                                        } else {
                                            if(structuralElementIdList.filter(structuralElementId => structuralElementId._id !== null).length !== structuralElements.length) { 
                                                client.close(); 
                                                return reject(400); 
                                            }
                                            db.collection('subtasks').find({$or:subtaskIdList}).toArray((foundErr, subtasks) => {
                                                if(foundErr){
                                                    client.close(); 
                                                    reject(foundErr);
                                                } else {
                                                    if(subtaskIdList.filter(subtaskId => subtaskId._id !== null).length !== subtasks.length) { 
                                                        client.close(); 
                                                        return reject(400); 
                                                    }
                                                    db.collection('workingTimes').updateOne({userId: new ObjectId(userId), period:period}, { $set: {workingTime: workingTime} }, {upsert: true}, (foundErr, collection) => {
                                                        if(foundErr){
                                                            client.close(); 
                                                            return reject(foundErr);
                                                        } else if(collection.modifiedCount === 0 && collection.upsertedId === null) {
                                                            client.close(); 
                                                            return reject('Nem sikerült módosítás!');
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









    replace(collectionName, query, entry) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);

                    db.collection(collectionName).replaceOne(query, entry, (foundErr, collection) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else {
                            client.close(); 
                            resolve();
                        }
                    });
                }
            });
        });
    }

    delete(collectionName, query) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if(err) {
                    console.log('DB Connection Error: ' + err );
                    reject(err);
                } else {
                    var db = client.db(this.dbName);

                    db.collection(collectionName).deleteOne(query, (foundErr, collection) => {
                        if(foundErr){
                            client.close(); 
                            reject(foundErr);
                        } else {
                            client.close(); 
                            resolve();
                        }
                    });
                }
            });
        });
    }

}


const mongoService = new MongoService(DBNAME, URL);

module.exports = mongoService;
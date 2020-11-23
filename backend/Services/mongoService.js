require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectId;

class MongoService {
    constructor(dbName, url) {
        this.url = url;
        this.dbName = dbName;
    }

    //TODO: docker container

    find(collectionName, query, options) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.log('DB Connection Error: ' + err);
                    return reject(err);
                } else {
                    var db = client.db(this.dbName);
                    db.collection(collectionName).find(query, options).toArray((foundErr, result) => {
                        if (foundErr) {
                            client.close();
                            return reject(foundErr);
                        } else {
                            client.close();
                            return resolve(result);
                        }
                    });
                }
            });
        });
    }

    update(collectionName, filter, update, options) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.log('DB Connection Error: ' + err);
                    return reject(err);
                } else {
                    var db = client.db(this.dbName);

                    db.collection(collectionName).updateOne(filter, update, options, (foundErr, collection) => {
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
        });
    }

    aggregate(collectionName, pipeline) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.log('DB Connection Error: ' + err);
                    return reject(err);
                } else {
                    var db = client.db(this.dbName);
                    db.collection(collectionName).aggregate(pipeline).toArray((foundErr, aggregated) => {
                        if (foundErr) {
                            client.close();
                            return reject(foundErr);
                        } else {
                            client.close();
                            return resolve(aggregated);
                        }
                    });
                }
            });
        });
    }

    insert(collectionName, entry) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.log('DB Connection Error: ' + err);
                    return reject(err);
                } else {
                    var db = client.db(this.dbName);

                    db.collection(collectionName).insertOne(entry, (foundErr, collection) => {
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
        });
    }


    delete(collectionName, query) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.log('DB Connection Error: ' + err);
                    return reject(err);
                } else {
                    var db = client.db(this.dbName);

                    db.collection(collectionName).deleteOne(query, (foundErr, collection) => {
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
        });
    }

}


const mongoService = new MongoService(process.env.DBNAME, process.env.URL);

module.exports = mongoService;
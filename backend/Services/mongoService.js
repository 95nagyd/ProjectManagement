const { DBNAME, URL } = require('../dbConfig');
var MongoClient = require('mongodb').MongoClient;


class MongoService {
    constructor(dbName, url){
        this.url = url;
        this.dbName = dbName;
    }

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
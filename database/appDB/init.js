db.dropDatabase();
db.users.createIndex({username: 1}, {unique: true});
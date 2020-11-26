db.dropDatabase();
db.users.createIndex({username: 1}, {unique: true});

db.projects.createIndex({name: 1}, {unique: true});
db.designPhases.createIndex({name: 1}, {unique: true});
db.structuralElements.createIndex({name: 1}, {unique: true});
db.subtasks.createIndex({name: 1}, {unique: true});

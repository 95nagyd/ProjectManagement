db.dropDatabase();
db.users.createIndex({username: 1}, {unique: true});

db.projects.createIndex({name: 1}, {unique: true});
db.designPhases.createIndex({name: 1}, {unique: true});
db.structuralElements.createIndex({name: 1}, {unique: true});
db.subtasks.createIndex({name: 1}, {unique: true});

db.projects.insertMany([{name:"Projekt 1"}, {name:"Projekt 2"}, {name:"Projekt 3"}, {name:"Projekt 4"}, {name:"Projekt 5"}]);
db.designPhases.insertMany([{name:"Tervfázis 1"}, {name:"Tervfázis 2"}, {name:"Tervfázis 3"}, {name:"Tervfázis 4"}, {name:"Tervfázis 5"}]);
db.structuralElements.insertMany([{name:"Szerkezeti elem 1"}, {name:"Szerkezeti elem 2"}, {name:"Szerkezeti elem 3"}, {name:"Szerkezeti elem 4"}, {name:"Szerkezeti elem 5"}]);
db.subtasks.insertMany([{name:"Részfeladat 1"}, {name:"Részfeladat 2"}, {name:"Részfeladat 3"}, {name:"Részfeladat 4"}, {name:"Részfeladat 5"}]);
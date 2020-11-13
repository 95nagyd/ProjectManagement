const mongoService = require('./mongoService');
const _ = require("underscore");
var ObjectId = require("mongodb").ObjectId;


async function getUsers(query) {
    return await mongoService.find('users', query, { projection: { password:0 }});
}

async function saveUser(user){

    let saveData = _.pick(user, 
        [
            'password',
            'title', 
            'lastName',
            'middleName',
            'firstName',
            'role',
            'telephone',
            'email'
        ]
    )
    if(saveData.password === '') { delete saveData.password; }
    console.log(saveData)
    
    return await mongoService.update('users', {_id: new ObjectId(user._id)}, { $set: saveData });
}

async function addUser(user){
    delete user._id;

    return await mongoService.insert('users', user);
}

module.exports = {
    getUsers: getUsers,
    saveUser: saveUser,
    addUser: addUser
}
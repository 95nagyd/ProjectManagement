const mongoService = require('./mongoService');
const _ = require("underscore");
var ObjectId = require("mongodb").ObjectId;


async function getUsers(query) {
    return await mongoService.find('users', query, { projection: { password:0 }});
}

//TODO: addUser
//TODO: saveUser

module.exports = {
    getUsers: getUsers
}
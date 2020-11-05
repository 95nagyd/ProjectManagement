const mongoService = require('./mongoService');
const _ = require("underscore");
var ObjectId = require("mongodb").ObjectId;


async function getUsers(query) {
    return await mongoService.find('users', query, { projection: { username:0, password:0 }});
}

module.exports = {
    getUsers: getUsers
}
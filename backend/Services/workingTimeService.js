const mongoService = require('./mongoService');
const _ = require("underscore");
var ObjectId = require("mongodb").ObjectId;


async function getWorkingTimeByGivenUserIdAndPeriod(userId, period) {
    return await mongoService.find('workingTimes', { userId: new ObjectId(userId), period:period}, { projection: { _id:0, workingTime:1 }});
}

async function saveCurrentUserWorkingTimeByGivenPeriod(userId, period, workingTime) {
    return await mongoService.update('workingTimes', {userId: new ObjectId(userId), period:period}, { $set: {workingTime: workingTime} }, {upsert: true} );
}

async function getFirstSavedPeriod(){
    return await mongoService.aggregate('workingTimes', [{$group:{_id:{}, firstPeriod: {$min: "$period"}}}]);
    
}

module.exports = {
    getWorkingTimeByGivenUserIdAndPeriod: getWorkingTimeByGivenUserIdAndPeriod,
    saveCurrentUserWorkingTimeByGivenPeriod: saveCurrentUserWorkingTimeByGivenPeriod,
    getFirstSavedPeriod: getFirstSavedPeriod
}
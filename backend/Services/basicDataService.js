const mongoService = require('./mongoService');
const _ = require("underscore");
var ObjectId = require("mongodb").ObjectId;


async function getProjects() {
    return await mongoService.find('projects', {}, {});
}

async function getDesignPhases() {
    return await mongoService.find('designPhases', {}, {});
}

async function getStructuralElements() {
    return await mongoService.find('structuralElements', {}, {});
}

async function getSubtasks() {
    return await mongoService.find('subtasks', {}, {});
}

async function getBasicData() {
    return await mongoService.getBasicData();
}


module.exports = {
    getProjects: getProjects,
    getDesignPhases: getDesignPhases,
    getStructuralElements: getStructuralElements,
    getSubtasks: getSubtasks,
    getBasicData : getBasicData
}
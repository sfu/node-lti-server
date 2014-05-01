// takes a SIS ID from Canvas and returns an array of the courses within
module.exports.coursesFromSisId = function(sisId) {
    if (!sisId) { return []; }
    return sisId.split(':');
}
var request = require('request');
var Q = require('q');

var courseUrlBase = 'http://www.sfu.ca/bin/wcm/course-outlines/?';
var canvasToken = process.env.CANVAS_TOKEN || '';
var canvasUrl = 'https://canvas.sfu.ca/api/v1/users/sis_login_id:USERNAME/profile?access_token=' + canvasToken;


module.exports.getAllOutlines = function(courses) {
    var promises = [];
    courses.forEach(function(course) {
        var deferred = Q.defer();
        course = course.replace(/-/g, '/');
        var url = courseUrlBase + course;
        request(url, function(err, response, body) {
            if (err) { deferred.reject(err); }
            else {
                try {
                    var outline = JSON.parse(body);
                } catch(JSONError) {
                    deferred.reject(JSONError);
                }
                deferred.resolve(outline);
            }
        });
        promises.push(deferred.promise);
    });
    return Q.all(promises);
};

module.exports.getCanvasProfiles = function(outlines) {
    var outlineCounter = 0;
    var deferred = Q.defer();
    outlines.forEach(function(outline) {
        outlineCounter++;
        var instructorCount = outline.hasOwnProperty('instructor') ? outline.instructor.length : 0;
        var instructorCounter = 0;
        if (instructorCount > 0) {
            outline.instructor.forEach(function(instructor, i) {
                var computingId = instructor.email.split('@')[0];
                var url = canvasUrl.replace('USERNAME', computingId);
                request(url, function(err, response, body) {
                    if (err) { deferred.reject(err); }
                    else {
                        try {
                            body = JSON.parse(body);
                        } catch (JSONError) {
                            deferred.reject(JSONError);
                        }
                        outline.instructor[i]['canvas'] = body;
                        instructorCounter++
                        if (instructorCounter === instructorCount) {
                            if (outlineCounter === outlines.length) {
                                deferred.resolve(outlines);
                            }
                        }
                    }
                });
            });
        }
    });
    return deferred.promise;
};
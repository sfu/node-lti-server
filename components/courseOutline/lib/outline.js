var request = require('request');
var Q = require('q');

var courseUrlBase = 'http://www.sfu.ca/bin/wcm/course-outlines/?';
var canvasToken = process.env.CANVAS_TOKEN || '';
var canvasProfileUrl = 'https://canvas.sfu.ca/api/v1/users/sis_login_id:USERNAME/profile?access_token=' + canvasToken;
var sfuCanvasProfileUrl = 'https://canvas.sfu.ca/sfu/api/user/USERNAME/profile?access_token=' + canvasToken;

module.exports.getAllOutlines = function(courses, ltiLaunchParameters) {
    var promises = [];
    courses.forEach(function(course) {
        var deferred = Q.defer();
        course = course.replace(/-/g, '/');
        var url = courseUrlBase + course;
        request(url, function(err, response, body) {
            if (err) { deferred.reject(err); }
            else if (response.statusCode === 404 || (response.statusCode === 200 && body === '{}')) {
                // The 200/{} check above is because this service used to return that for a non-found course.
                // Ron fixed it to return 404 and a error message, but some of the nodes are still returning 200
                // because CQ.
                deferred.reject({
                    statusCode: 404,
                    data: {
                        title: 'Course Outline Not Found',
                        message: 'A course outline could not be located for this course.'
                    }
                });
            } else {
                try {
                    var outline = JSON.parse(body);
                    outline.canvas = {
                        courseId: ltiLaunchParameters.custom_canvas_course_id,
                        sisId: ltiLaunchParameters.lis_course_offering_sourcedid,
                        courseUrl: ltiLaunchParameters.launch_presentation_return_url
                    }
                    deferred.resolve(outline);
                } catch(JSONError) {
                    deferred.reject(JSONError);
                    return false;
                }
            }
        });
        promises.push(deferred.promise);
    });
    return Q.all(promises);
};

module.exports.getCanvasProfilesForAllCourses = function(outlines) {
    var promises = [];
    outlines.forEach(function(outline) {
        promises.push(getCanvasProfilesForCourse(outline));
    });
    return Q.all(promises);
};

var getCanvasProfilesForCourse = function(outline) {
    var numInstructors = outline.instructor.length || 0;
    var deferred = Q.defer();
    var promises = [];
    for (var i = 0; i < numInstructors; i++) {
        promises.push(getCanvasProfileForInstructor(outline.instructor[i]));
    };

    var profiles = Q.all(promises);
    profiles.then(function(profiles) {
        profiles.forEach(function(profile, idx, array) {
            outline.instructor[idx] = profile;
        });
        deferred.resolve(outline);
    }, function(reason) {
        deferred.reject(reason);
    });

    return deferred.promise;
};

 var getCanvasProfileForInstructor = function(instructor) {
    var deferred = Q.defer();
    var id = instructor.email.split('@')[0];
    var url = canvasProfileUrl.replace('USERNAME', id);

    request(url, function(err, response, body) {
        var profile;
        if (err || response.statusCode !== 200) {
            var error = err ? err : new Error('Non-200 response from Canvas profile endpoint. URL: ' + url + ' SC: ' + response.statusCode + ' Body: ' + response.body);
            deferred.reject({error: error});
        } else {
            try {
                profile = JSON.parse(body);
            } catch(JSONError) {
                deferred.reject({error: new Error('JSON parse error: ' + JSONError.message + ' Body: ' + body)});
            }
            instructor.canvas = profile;
            getMessagePathForInstructor(instructor).then(deferred.resolve);
        }
    });
    return deferred.promise;
}

var getMessagePathForInstructor = function(instructor) {
    var deferred = Q.defer();
    var id = instructor.email.split('@')[0];
    var url = sfuCanvasProfileUrl.replace('USERNAME', id);
    request(url, function(err, response, body) {
        var profile;
        if (err || response.statusCode !== 200) {
            deferred.reject();
            instructor.canvas.message_user_path = profile.message_user_path;
            deferred.resolve(instructor);
        } else {
            try {
                profile = JSON.parse(body);
            } catch(JSONError) {
                deferred.reject({error: new Error('JSON parse error: ' + JSONError.message + ' Body: ' + body)});
            }
        }
    });
    return deferred.promise;
}

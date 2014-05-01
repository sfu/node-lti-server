var utils = require('../../lib/utils');
var outline = require('./lib/outline');
// var cqUrl = 'http://www-stage.its.sfu.ca/bin/wcm/course-outlines';
var cqUrl = 'http://www.sfu.ca/bin/wcm/course-outlines';

exports.index = function(req, res) {
    function handleError(reason) {
        var template = reason.template || 'error';
        var statusCode = reason.statusCode || 500;
        var data = reason.data || {
            title: 'An Error Occurred',
            message: 'We&apos;re sorry, but an error occured while fetching the course outline. Please try again later.'
        }
        res.status(statusCode)
        res.render(template, data);
    };

    function renderOutline(outlines) {
        res.render(path.join(__dirname, 'views/index'), {outlines: outlines})
    }

    var courses = utils.coursesFromSisId(req.body.lis_course_offering_sourcedid || null);
    if (!courses) {
        renderError('500', 500, {title: 'Non-Credit Course', message: 'This does not appear to be a credit course.'});
        return false;
    }

    outline.getAllOutlines(courses, req.body).
        then(outline.getCanvasProfilesForAllCourses, handleError).
        then(renderOutline, handleError);
}
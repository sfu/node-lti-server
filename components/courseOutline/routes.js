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
    console.log(courses);
    if (!courses) {
        renderError('500', 500, {title: 'Non-Credit Course', message: 'This does not appear to be a credit course.'});
        return false;
    }

    outline.getAllOutlines(courses).then(outline.getCanvasProfiles).then(renderOutline, renderError);

    // var counter = 0;
    // var outlines = [];
    // courses.forEach(function(course) {
    //     getOutline(course.replace(/-/g, '/'), function(err, resp, body) {
    //         console.log(resp.statusCode);
    //         counter++;
    //         if (err || resp.statusCode !== 200) {
    //             errorFound = true;
    //             app.logger.error('Error fetching course outline:\n\n', err.toString());
    //             renderOutline(true, null);
    //             return false;
    //         }
    //         else {
    //             try {
    //                 body = JSON.parse(body);
    //                 outlines.push(body);
    //                 body.sisId = course;
    //                 console.log(body);
    //             } catch (JSONError) {
    //                 errorFound = true;
    //                 app.logger.error('Error parsing data from course outlines; does not appear to be valid JSON.\n\n', body, JSON.stringify(resp, null, '  '));
    //             }
    //             renderOutline(errorFound, outlines);
    //         }
    //     });
    // });
}

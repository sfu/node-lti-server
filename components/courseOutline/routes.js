var utils = require('../../lib/utils');
var outline = require('./lib/outline');

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
        if (!outlines || outlines.length === 0) {
            handleError();
            return false;
        }
        res.render(path.join(__dirname, 'views/index'), {outlines: outlines})
    }

    var courses = utils.coursesFromSisId(req.body.lis_course_offering_sourcedid || null);
    if (!courses.length) {
        // renderError('error', 400, {title: 'Non-Credit Course', message: 'This does not appear to be a credit course. Course outlines are only available for SFU credit courses.'});
        handleError({
            statusCode: 400,
            data: {
                message: 'This does not appear to be a credit course. Course outlines are only available for SFU credit courses.',
                title: 'Non-Credit Course'
            }
        });
        return false;
    }

    outline.getAllOutlines(courses, req.body).
        then(outline.getCanvasProfilesForAllCourses, handleError).
        then(renderOutline, handleError).
        catch(handleError);
}

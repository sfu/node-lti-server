var request = require('request');
var utils = require('../../lib/utils.js');
var cqUrl = 'http://www-stage.its.sfu.ca/bin/wcm/course-outlines';
// var cqUrl = 'http://www.sfu.ca/bin/wcm/course-outlines';


function getOutline(courseSisId, cb) {
    request.get(cqUrl + '?' + courseSisId, function(err, resp, body){
        cb(err, resp, body);
    });
}

exports.index = function(req, res) {

    function renderError() {
        res.render(500, {title: 'An Error Occurred', message: 'We&apos;re sorry, but an error occured while fetching your Library Reserves. Please try again later.'});
    };

    function renderOutline(err, data) {
        if (err) {
            renderError();
            return false;
        }
    }

    var courses = utils.coursesFromSisId(req.body.lis_course_offering_sourcedid || null);
    if (!courses) {
        res.status(500);
        res.render('500', {title: 'Non-Credit Course', message: 'This does not appear to be a credit course.'});
        return false;
    }

    // TODO REMOVE ME
    //
    courses = ['1144-iat-100-d100'];

    var counter = 0;
    var outlines = [];
    courses.forEach(function(course) {
        getOutline(course.replace(/-/g, '/'), function(err, resp, body) {
            counter++;
            if (err) {
                app.logger.error('Error fetching course outline:\n\n', err.toString());
                renderOutline(true, null);
                return false;
            }
            else {
                outlines.push(JSON.parse(body));
                if (counter === courses.length) {
                    res.render(path.join(__dirname, 'views/index'), {outlines: outlines})
                }
            }
        });
    });


}
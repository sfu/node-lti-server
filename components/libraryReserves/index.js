var request = require('request');


module.exports = function(app) {

    app.all('/libraryReserves', function(req,res) {

        var libApiUrl = 'http://api.lib.sfu.ca/reserves/search',
            uniqueList = [],
            reserveItems = [],
            counter = 0
            errorFound = false;

        function renderError() {
            res.render(500, {title: 'An Error Occurred', message: 'We&apos;re sorry, but an error occured while fetching your Library Reserves. Please try again later.'});
        };

        function renderReserves(err, data) {
            if (err) {
                renderError();
                return false;
            }
            if (counter === courses.length) {
                res.render(path.join(__dirname, 'views/index'), { data: data, course: req.body, title: 'Library Reserves' });
            }
        }

        // get the course id
        var courseSisId, courses, qs;
        courseSisId = (req.body.lis_course_offering_sourcedid  || req.query.lis_course_offering_sourcedid) ? (req.body.lis_course_offering_sourcedid || req.query.lis_course_offering_sourcedid) : null;
        if (!courseSisId) {
            res.status(500);
            res.render('500', {title: 'Non-Credit Course', message: 'This does not appear to be a credit course.'});
            return false;
        }

        courseSisId = courseSisId.split(':')[0].split('-');
        courses = courseSisId.split(':');
        courses.forEach(function(course) {
            course = course.split('-');
            request({
                url: libApiUrl,
                qs: {
                    semester: course[0],
                    department: course[1],
                    number: course[2],
                    section: course[3]
                }
            }, function(err, resp, body) {
                counter++;
                if (err) {
                    errorFound = true;
                    app.logger.error('Error getting data from library:\n\n', err.toString());
                    renderReserves(true, null);
                    return false;
                }

                try {
                    body = JSON.parse(body);
                    body.reserves.forEach(function(reserveItem) {
                        if (uniqueList.indexOf(reserveItem.item_url) === -1) {
                            uniqueList.push(reserveItem.item_url);
                            reserveItems.push(reserveItem);
                        }
                    });
                } catch (JSONError) {
                    errorFound = true;
                    app.logger.error('Error parsing data from library; does not appear to be valid JSON.\n\n', body, JSON.stringify(resp, null, '  '));
                }
                renderReserves(errorFound, reserveItems);
            });
        });
    });

};
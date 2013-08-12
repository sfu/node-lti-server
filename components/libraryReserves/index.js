var request = require('request');

module.exports = function(app) {

    app.all('/libraryReserves', function(req,res) {
        if (req.method !== 'POST') {
            res.send(405);
            return;
        }

        // get the course id
        var courseSisId, qs;
        courseSisId = req.body.lis_course_offering_sourcedid ? req.body.lis_course_offering_sourcedid.split('-') : null;
        if (!courseSisId) {
            res.status(500);
            res.render('500', {title: 'Non-Credit Course', message: 'This does not appear to be a credit course.'});
            return false;
        }

        request({
            url: 'http://api.lib.sfu.ca/reserves/search',
            qs: {
                semester: courseSisId[0],
                department: courseSisId[1],
                number: courseSisId[2],
                section: courseSisId[3]
            }
        }, function(err, resp, body) {
            res.render(path.join(__dirname, 'views/index'), { data: JSON.parse(body), course: req.body, title: 'Library Reserves' });
        });
    });

};
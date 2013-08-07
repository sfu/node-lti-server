var request = require('request');

module.exports = function(app) {

    app.all('/libraryReserves', function(req,res) {
        if (req.method !== 'POST') {
            res.send(405);
            return;
        }

        // get the course id
        var courseSisId = req.body.lis_course_offering_sourcedid.split('-')
          , qs = {
                semester: courseSisId[0],
                department: courseSisId[1],
                number: courseSisId[2],
                section: courseSisId[3]
        };

        request({
            url: 'http://api.lib.sfu.ca/reserves/search',
            qs: qs
        }, function(err, resp, body) {
            res.render(path.join(__dirname, 'views/index'), { data: JSON.parse(body), course: req.body, title: 'Library Reserves' });
        });
    });

};
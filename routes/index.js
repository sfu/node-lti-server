exports.index = function(req, res) {
    if (req.method !== 'POST') {
        res.send(405);
        return;
    }

    var request = require('request');

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
        console.log(resp);
        res.render('index', { data: JSON.parse(body), course: req.body, title: 'Library Reserves' });
    });

};
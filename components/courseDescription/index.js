var request = require('request');

module.exports = function(app) {
    app.all('/courseDescription', function(req, res) {
        if (req.method !== 'POST') {
            res.send(405);
            return;
        }

        var course = req.body.hasOwnProperty('lis_course_offering_sourcedid') ? req.body.lis_course_offering_sourcedid.split('-') : null;

        if (!course || course[0] === 'sandbox') {
            res.status(404);
            res.render(path.join(__dirname, 'views/no_course'));
            return false;
        }

        request({
            url: 'https://canvas.sfu.ca/sfu/api/v1/terms/' + course[0]
        }, function(err, resp, termData) {
            var termName = JSON.parse(termData)[0].name.split(' ');
            var courseDescUrl = 'http://www.sfu.ca/content/sfu/students/calendar/' + termName[1] + '/' + termName[0].toLowerCase() + '/courses/' + course[1] + '/' + course[2].toLowerCase() + '/jcr:content/description.json';
            request({
                url: courseDescUrl
            }, function(err, resp, descriptionBody) {
                var tmplData = {
                    data : {
                        course: course,
                        term: JSON.parse(termData)[0]
                    }
                };
                if (404 === resp.statusCode) {
                    res.render(path.join(__dirname, 'views/404'), tmplData);
                } else if (200 === resp.statusCode && JSON.parse(descriptionBody).hasOwnProperty('description')) {
                    tmplData.data['description'] = JSON.parse(descriptionBody).description;
                    tmplData.data['lti'] = req.body;
                    tmplData.data.course['url'] = 'https://students.sfu.ca/calendar/' + termName[1] + '/' + termName[0].toLowerCase() + '/courses/' + course[1] + '/' + course[2] + '.html';
                    res.render(path.join(__dirname, 'views/description'), tmplData);
                } else {
                    res.render('500');
                }
            });
        });
    });
};
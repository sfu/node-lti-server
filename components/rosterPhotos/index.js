var request = require('request');
var PhotoClient = require('node-sfu-photos-client');
var fs = require('fs');
var path = require('path');
var noPhotoImage = fs.readFileSync(path.resolve(__dirname, 'public/images/no_photo.png')).toString('base64');
var LTI = require('ims-lti');

function hasLaunchForCourse(req, res, next) {
    var courseId = req.params.course;
    if (req.session.launches && req.session.launches[courseId]) {
        next();
    } else {
        res.send(403);
    }
}

module.exports = function(app, config) {
    var photoClient = new PhotoClient(config.photoClient);
    var provider = new LTI.Provider('rosterphotos', config.ltiSecret);

    app.post('/rosterPhotos/launch', function(req, res) {
        provider.valid_request(req, function(err, isValid) {
            if (err) {
                res.render('500', { title: 500 });
            } else if (!isValid) {
                // TODO redirect to a proper unauthorized page
                res.send('403');
            } else {
                var courseId = provider.body.custom_canvas_course_id;
                req.session.launches = req.session.launches || {};
                req.session.launches[courseId] = provider;
                req.session.launches[courseId].body = provider.body;
                res.render(path.join(__dirname, 'views/index'), { course: provider.body, title: 'Course Roster' })
            }
        });
    });

    app.get('/rosterPhotos/:course', hasLaunchForCourse, function(req, res) {
        var launchData = req.session.launches[req.params.course];
        var canvasurl = launchData.body.custom_canvas_api_domain;
        var proto = launchData.body.launch_presentation_return_url.match(/https\:\/\//) ? 'https://' : 'http://';
        var courseId = launchData.body.custom_canvas_course_id;
        var apiUrl = proto + canvasurl + '/api/v1/courses/' + courseId + '/users';
        var queryParams = {
            enrollment_type: 'student',
            per_page: '3000'
        };

        request({
            uri: apiUrl,
            qs: queryParams,
            method: 'GET',
            json: true,
            headers: {
                'Authorization': 'Bearer ' + config.canvasApiKey
            }
        }, function(err, response, roster) {
            var sfuIds = roster.map(function(user) {
                return user.sis_user_id;
            });
            photoClient.getPhoto(sfuIds).then(function(photos) {
                // ids that don't have photos will be undefined in the photos array
                // replace with placeholder data

                var normalizedPhotos = photos.map(function(photo, index) {
                    if (!photo) {
                        var name = roster[index].sortable_name.split(', ');
                        photo = {
                            LastName: name[0],
                            FirstName: name[1],
                            SfuId: roster[index].sis_user_id,
                            PictureIdentification: noPhotoImage
                        }
                    }
                    photo.canvasProfileUrl = launchData.body.launch_presentation_return_url + '/users/' + roster[index].id
                    return photo;
                });

                var rows = [], maxPerRow = 4;
                for (var i=0, j=normalizedPhotos.length; i<j; i+=maxPerRow) {
                  rows.push(normalizedPhotos.slice(i,i+maxPerRow));
                }
                res.render(path.join(__dirname, 'views/row'), { rows: rows, layout: false });
            }).fail(function(err) {
                res.render('500', { title: '500' });
            });

        });
    });
};
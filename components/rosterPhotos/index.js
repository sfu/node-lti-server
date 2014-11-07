var request = require('request');
var PhotoClient = require('node-sfu-photos-client');
var fs = require('fs');
var path = require('path');
var url = require('url');
var noPhotoImage = fs.readFileSync(path.resolve(__dirname, 'public/images/no_photo.png')).toString('base64');
var LTI = require('ims-lti');
var RedisNonceStore = require ('ims-lti/lib/redis-nonce-store');


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
    var nonceStore = new RedisNonceStore('rosterphotos', require('redis').createClient(config.redisNonceStore.port, config.redisNonceStore.host));
    var provider = new LTI.Provider('rosterphotos', config.ltiSecret, nonceStore);

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
                req.session.launches[courseId] = provider.body;
                // req.session.launches[courseId].body = provider.body;
                res.render(path.join(__dirname, 'views/index'), { course: provider.body, title: 'Course Roster' })
            }
        });
    });

    app.get('/rosterPhotos/:course', hasLaunchForCourse, function(req, res) {
        var launchData = req.session.launches[req.params.course];
        var parsedUrl = url.parse(launchData.launch_presentation_return_url);
        var courseId = launchData.custom_canvas_course_id;
        var apiUrl = parsedUrl.protocol + '//' + parsedUrl.host + '/api/v1/courses/' + courseId + '/users';
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
            if (!roster || !roster.length) {
                res.render('500', { title: '500' });
                return false;
            }
            var sfuIds = roster.map(function(user) {
                return user.sis_user_id;
            });
            photoClient.getPhoto(sfuIds).then(function(photos) {
                // ids that don't have photos will be undefined in the photos array
                // replace with placeholder data

                if (!photos || !photos.length) {
                    res.render('500', { title: '500' });
                    return false;
                }

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
                    photo.canvasProfileUrl = parsedUrl.protocol + '//' + parsedUrl.host + '/courses/' + courseId + '/users/' + roster[index].id;
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
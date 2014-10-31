var request = require('request');
var PhotoClient = require('node-sfu-photos-client');
var fs = require('fs');
var path = require('path');
var noPhotoImage = fs.readFileSync(path.resolve(__dirname, 'public/images/no_photo.png')).toString('base64');

module.exports = function(app, config) {
    var client = new PhotoClient(config.photoClient);
    app.all('/rosterPhotos', function(req,res) {
        if (req.method !== 'POST') {
            res.send(405);
            return;
        }
        var canvasurl = req.body.custom_canvas_api_domain;
        var proto = req.body.launch_presentation_return_url.match(/https\:\/\//) ? 'https://' : 'http://';
        var courseId = req.body.custom_canvas_course_id;
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
            client.getPhoto(sfuIds).then(function(photos) {
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
                    photo.canvasProfileUrl = req.body.launch_presentation_return_url + '/users/' + roster[index].id
                    return photo;
                });

                var rows = [], maxPerRow = 4;
                for (var i=0, j=normalizedPhotos.length; i<j; i+=maxPerRow) {
                  rows.push(normalizedPhotos.slice(i,i+maxPerRow));
                }
                res.render(path.join(__dirname, 'views/index'), { rows: rows, course: req.body, title: 'Course Roster' })
            }).fail(function(err) {
                console.log(arguments);
                res.render('500', { title: '500' });
            });

        });
    });
};
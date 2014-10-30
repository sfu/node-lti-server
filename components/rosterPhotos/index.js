var request = require('request');

module.exports = function(app) {
    app.all('/rosterPhotos', function(req,res) {
        if (req.method !== 'POST') {
            res.send(405);
            return;
        }
        console.log(req.body);
        res.send("ok");
    });
};
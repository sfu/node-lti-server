module.exports = function(app) {
    app.get('/oembed', function(req, res) {
        console.log(req.query);
        var html = req.query.html;
        var returnBody = {
            version: "1.0",
            type: "rich",
            html: html,
            width: null,
            height: null
        };
        res.set('Content-Type', 'application/json');
        res.send(returnBody);
    });
};


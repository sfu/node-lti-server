module.exports = function(app) {
    app.get('/oembed', function(req, res) {
        var q = req.query,
            allowedTypes = ['photo', 'video', 'link', 'rich'];

        if (allowedTypes.indexOf(q.type) < 0) {
            res.send(500);
            return false;
        }

        var returnBody = {
            version: '1.0',
            type: q.type,
            width: q.width || null,
            height: q.height || null,
        }

        if ('photo' === q.type) {
            returnBody['url'] = q.url;
        } else if ('link' === q.type) {
            for (var key in q) {
                returnBody[key] = q[key];
            }
        } else if ('rich' === q.type || 'video' === q.type) {
            returnBody['html'] = q.html;
        }

        res.set('Content-Type', 'application/json');
        res.send(returnBody);
    });
};
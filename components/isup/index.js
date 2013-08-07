module.exports = function(app) {
    app.get('/isup', function(req, res) {
        res.set('Content-Type', 'text/plain');
        res.send('ok');
    });
}
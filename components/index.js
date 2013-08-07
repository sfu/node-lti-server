var fs = require('fs')
    path = require('path');

module.exports = function(app, express) {
    fs.readdirSync(__dirname).forEach(function(component) {
        if (fs.lstatSync(path.join(__dirname, component)).isDirectory()) {
            var componentPath = path.join(__dirname, component),
                publicPath = path.join(componentPath, 'public');

            require(componentPath)(app);

            if ((fs.readdirSync(componentPath).indexOf('public') >= 0) && fs.lstatSync(publicPath).isDirectory()) {
                app.use('/' + component, express.static(publicPath));
            }
        }
    });
}

var fs = require('fs')
    path = require('path');

module.exports = function(app, express) {
    fs.readdirSync(__dirname).forEach(function(component) {
        if (fs.lstatSync(path.join(__dirname, component)).isDirectory()) {
            var componentPath = path.join(__dirname, component),
                publicPath = path.join(componentPath, 'public');

            var configPath = path.resolve(path.dirname(require.main.filename), 'config', component + '.json');
            var config;
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            };

            require(componentPath)(app, config);

            if ((fs.readdirSync(componentPath).indexOf('public') >= 0) && fs.lstatSync(publicPath).isDirectory()) {
                app.use('/' + component, express.static(publicPath));
            }
        }
    });
}

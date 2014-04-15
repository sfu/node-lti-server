var routes = require('./routes.js');
var ejs = require('ejs');
module.exports = function(app) {
    ejs.filters.pluralize = function(num, str) {
        return num === 1 ? str : str + 's';
    };

    app.post('/courseOutline', routes.index);
}
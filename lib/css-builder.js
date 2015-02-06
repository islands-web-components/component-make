var fs = require('fs');
var path = require('path');
var stylus = require('stylus');
var Q = require('q');

var Builder = function(block) {
    this.block = block;
    this.content = [
        '@import "' + path.join(__dirname, '../node_modules/stylobate') + '";',
        'rem = rem_px',
        '@import "' + path.join(__dirname, '../node_modules/stylobate-islands') + '";',
        'set-skin-namespace("islands");',
        '@import "' + block + '.styl";'
    ].join('\n');
};

Builder.prototype.run = function() {
    var building = Q.defer();
    var style = stylus(this.content);
    var name = this.block;

    style.render(function(err, css) {
        if (err) {
            building.reject(err);
            return;
        }
        building.resolve({
            name: name,
            css: css
        });
    });

    return building.promise;
};

module.exports = Builder;

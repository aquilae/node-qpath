(function (module, require) {
    "use strict";

    var $fs = require('fs'),
        $path = require('path');

    Path.prototype.stat = function stat(callback) {
        $fs.stat(this.path, function (err, stats) {
            if (typeof (err) === 'undefined' || err === null) {
                stats = $stats(
                    stats, 0, this.basename,
                    this.basename, this.path);
            }
            if (callback) callback(err, stats);
        }.bind(this));
    };

    Path.prototype.statSync = function statSync() {
        var stats = $fs.statSync(this.path);
        return $stats(
            stats, 0, this.basename,
            this.basename, this.path);
    };

    Path.prototype.readStats = function (callback) {
        try {
            var result = this.readStatsSync();
            if (callback) callback(null, result);
        }
        catch (exc) {
            if (callback) callback(exc);
        }
    };

    Path.prototype.readStatsSync = function statsSync() {
        return recursion.call(this, 0, '');

        function recursion(level, affix) {
            var stats = [], push = function (item) { stats.push(item); return true; };
            $fs.readdirSync($path.join(this.path, affix)).forEach(function (name) {
                var result = $stats(
                    $fs.statSync($path.join(this.path, affix, name)), level, name,
                    $path.join(affix, name), $path.join(this.path, affix, name));
                if (push(result) && result.isDirectory()) {
                    recursion.call(this, level + 1, result.name).forEach(push);
                }
            }.bind(this));
            return stats;
        }
    };

    return module.exports = Path;

    function $stats(stats, level, base, name, path) {
        if (stats) {
            stats.level = level;
            stats.base = base;
            stats.name = name;
            stats.path = path;
        }
        return stats;
    }

    function Path(path) {
        if (!(this instanceof Path)) {
            return new Path(path);
        }
        Object.defineProperties(this, {
            'path': {
                value: path,
                writable: false,
                enumerable: true,
                configurable: false
            },
            'dirname': {
                get: function () {
                    var value = null;
                    return function dirname_get() {
                        if (value === null) {
                            value = $path.dirname(this.path);
                        }
                        return value;
                    }.bind(this);
                }.call(this),
                enumerable: true,
                configurable: false
            },
            'basename': {
                get: function () {
                    var value = null;
                    return function basename_get() {
                        if (value === null) {
                            value = $path.basename(this.path);
                        }
                        return value;
                    }.bind(this);
                }.call(this),
                enumerable: true,
                configurable: false
            }
        });
    }
})(module, require);

(function (module, require) {
    "use strict";

    var $fs = require('fs'),
        $path = require('path');

    Path.prototype.exists = function exists(callback) {
        $fs.exists(this.path, callback);
    };

    Path.prototype.existsSync = function existsSync() {
        return $fs.existsSync(this.path);
    };

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

    Path.prototype.readStats = function readStats(callback) {
        try {
            var result = this.readStatsSync();
            if (callback) callback(null, result);
        }
        catch (exc) {
            if (callback) callback(exc);
        }
    };

    Path.prototype.readStatsSync = function readStatsSync() {
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

    Path.prototype.mkdirp = function mkdirp(mode, callback) {
        try {
            if (typeof (mode) === 'function') {
                callback = mode;
                mode = void 0;
            }
            var segments = $segments(this.path);
            next(mode, this, segments, '', 0, segments.length, callback);
        }
        catch (exc) {
            callback(exc);
        }

        function mkdirs(mode, qp, segments, path, index, length, cb) {
            if (index < length) {
                path = $path.join(path, segments[index]);
                $fs.mkdir(path, mode, function (err) {
                    if (typeof (err) === 'undefined' || err === null) {
                        mkdirs(mode, qp, segments, path, index + 1, length, cb);
                    }
                    else {
                        cb(err);
                    }
                });
            }
            else {
                cb(null, qp);
            }
        }

        function next(mode, qp, segments, path, index, length, cb) {
            try {
                if (index < length) {
                    path = $path.join(path, segments[index]);
                    $fs.exists(path, function (exists) {
                        if (exists) {
                            next(mode, qp, segments, path, index + 1, length, cb);
                        }
                        else {
                            $fs.mkdir(path, mode, function (err) {
                                if (typeof (err) !== 'undefined' && err !== null) {
                                    if (cb) cb(err);
                                }
                                else {
                                    mkdirs(mode, qp, segments, path, index + 1, length, cb);
                                }
                            });
                        }
                    });
                }
                else {
                    if (cb) cb(null, qp);
                }
            }
            catch (exc) {
                if (cb) cb(exc);
            }
        }
    };

    Path.prototype.mkdirpSync = function mkdirpSync(mode) {
        var segments = $segments(this.path),
            path = '', skipCheck = false;
        for (var i = 0, ii = segments.length; i < ii; ++i) {
            var segment = segments[i];
            path = $path.join(path, segment);
            if (skipCheck || !$fs.existsSync(path)) {
                skipCheck = true;
                $fs.mkdirSync(path);
            }
        }
        return this;
    };

    return module.exports = Path;

    function $segments(path) {
        var segments = [], name;
        while (name = $path.basename(path)) {
            segments.push(name);
            path = path.slice(0, -name.length - 1);
        }
        if (path) segments.push(path);
        segments.reverse();
        return segments;
    }

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

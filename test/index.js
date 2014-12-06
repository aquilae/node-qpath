(function (require) {
    "use strict";
    var fs = require('fs'),
        path = require('path'),
        qpath = require('../lib/qpath'),
        assert = require('assert');

    describe('qpath', function () {
        describe('#path', function () {
            it('should be equal to supplied target path', function () {
                var targetPath = '/some/path/to/some/place';
                assert.equal(qpath(targetPath).path, targetPath);
            });
        });
        describe('#basename', function () {
            it('should be equal to `path.basename()` when target path points to a file', function () {
                var qp = createFilePath();
                assert.equal(qp.basename, path.basename(qp.path));
            });
            it('should be equal to `path.basename()` when target path points to a directory', function () {
                var qp = createDirPath();
                assert.equal(qp.basename, path.basename(qp.path));
            });
            it('should call `path.basename()` only once', function () {
                var $basename = path.basename, timesCalled = 0;
                path.basename = function () {
                    ++timesCalled;
                    return $basename.apply(this, arguments);
                };
                try {
                    var qp = createDirPath(),
                        _ = qp.basename + qp.basename + qp.basename;
                }
                finally {
                    path.basename = $basename;
                }
                assert.equal(timesCalled, 1);
            });
        });
        describe('#dirname', function () {
            it('should be equal to `path.dirname()` when target path points to a file', function () {
                var qp = createFilePath();
                assert.equal(qp.dirname, path.dirname(qp.path));
            });
            it('should be equal to `path.dirname()` when target path points to a directory', function () {
                var qp = createDirPath();
                assert.equal(qp.dirname, path.dirname(qp.path));
            });
            it('should call `path.dirname()` only once', function () {
                var $dirname = path.dirname, timesCalled = 0;
                path.dirname = function () {
                    ++timesCalled;
                    return $dirname.apply(this, arguments);
                };
                try {
                    var qp = createDirPath(),
                        _ = qp.dirname + qp.dirname + qp.dirname;
                }
                finally {
                    path.dirname = $dirname;
                }
                assert.equal(timesCalled, 1);
            });
        });
        describe('#statSync()', function () {
            it('should return object equal to `fs.statSync()` result', function () {
                var qp = createFilePath(),
                    actual = qp.statSync(),
                    expected = fs.statSync(qp.path);
                assertStats(actual, expected, qp.path);
            });
        });
        describe('#readStatsSync()', function () {
            it('should return proper stats list representing directory file structure', function () {
                var qp = createDirPath(),
                    expectStats = function (relativePath) {
                        var absolutePath = path.join(__dirname, relativePath);
                        return {
                            path: absolutePath,
                            stats: fs.statSync(absolutePath)
                        };
                    },
                    expected = [
                        expectStats('dummy-directory.ignore/dummy-file.ignore'),
                        expectStats('dummy-directory.ignore/another-dummy-directory.ignore'),
                        expectStats('dummy-directory.ignore/another-dummy-directory.ignore/another-dummy-file.ignore')
                    ],
                    actual = createDirPath().readStatsSync();
                assert(Array.isArray(actual), 'actual value is not an array');
                assert.equal(actual.length, expected.length, 'list lengths differ');
                actual.forEach(function (actual) {
                    for (var i = 0; i < expected.length; ++i) {
                        if (actual.path === expected[i].path) {
                            assertStats(actual, expected[i].stats, expected[i].path);
                            return;
                        }
                    }
                    assert.fail(actual.path, null, 'actual path was not present in expected list (' + actual.path + ')');
                });
            });
        });
    });

    function createDirPath() {
        return qpath(path.join(__dirname, 'dummy-directory.ignore'));
    }

    function createFilePath() {
        return qpath(path.join(__dirname, 'dummy-directory.ignore/dummy-file.ignore'));
    }

    function assertStats(actual, expected, path) {
        assert.equal(actual.path, path);
        for (var key in expected) {
            if (expected.hasOwnProperty(key)) {
                var expectedValue = expected[key],
                    actualValue = actual[key],
                    type = typeof (expectedValue);
                assert.equal(typeof (actualValue), type, 'types of `' + key + '` differ');
                if (type === 'function') {
                    assert.equal(actualValue(), expectedValue(), 'results of `' + key + '()` differ');
                }
                else if (expectedValue instanceof Date) {
                    assert.equal(actualValue.getTime(), expectedValue.getTime(), 'values of `' + key + '` differ');
                }
                else {
                    assert.equal(actualValue, expectedValue, 'values of `' + key + '` differ');
                }
            }
        }
    }
})(require);

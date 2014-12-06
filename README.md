node-qpath
==========

Object-oriented file system and path API for Node.JS

#### Basic API

```js
var qp = require('qpath')('/path/to/something');

qp.path // returns '/path/to/something'
qp.basename // returns 'something' (equivalent to require('path').basename())
qp.dirname // returns '/path/to' (equivalent to require('path').dirname())

qp.exists([callback]) // equivalent to require('fs').exists()
qp.existsSync() // synchronous version of `#exists()`

qp.stat([callback]) // returns extended `Stats` object (equivalent to require('fs').stat())
qp.statSync() // synchronous version of `#stat()`

qp.readStats([callback]) // returns list of extended `Stats` objects
                       // for each file and directory under `path` (recursively)
qp.readStatsSync() // synchronous version of `#readStats()`

qp.mkdirp([mode], [callback]) // equivalent to unix `mkdir -p`
qp.mkdirpSync([mode]) // synchronous version of `#mkdirp()`
```

#### Extended Stats object

```js
// `$path` - path provided to `qpath()` function
stats.path // absolute path that is represented by this `Stats` object
stats.level // when returned from `#readStats()`: zero-based nesting
            // level relative to `$path`; zero (0) otherwise
stats.base // equivalent to require('path').basename(stats.path)
stats.name // equivalent to require('path').relative($path, stats.path)
```

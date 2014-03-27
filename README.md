# sync-memcached-store

Synchronous Fibers-powered Memcached store for [sync-cache](https://github.com/jtblin/sync-cache). The store use [syncho](https://github.com/jtblin/syncho)
to retrieve data "synchronously" from memcached so the code needs to run in a Fiber.

## Usage

    npm install sync-memcached-store --save

```js
var Sync = require('syncho')
    , SyncCache = require('sync-cache')
    , MC = require('sync-memcached-store')
    , mc = new MC({uri: 'localhost:11211', maxAge: 1000*60*60, ns: 'mynamespace'})
    , cache = new SyncCache({store: mc, load: mySyncFunction })
    ;

Sync(function () {
  console.log(cache.get('some-key'));
});

function mySyncFunction () {
  return 'some value';
}
```

### Parameters

- `uri` - memcached endpoint string, can be passed as a `uri` property of the options object instead
- `options` - an options object

### Options

- `uri` - memcached endpoint
- `ns` - optional namespace
- `maxAge` - maximum number of milliseconds to keep items, defaults **60000**
- `timeout` - operation timeout, defaults **1000**

## Testing

Unit tests: `npm test`

Integration tests (require local memcached server running on default port): `npm run integration`
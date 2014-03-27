module.exports = MemcachedStore;

var Memcached = require('memcached'), Sync = require('syncho');

function MemcachedStore (options) {
  if (!(this instanceof MemcachedStore))
    return new MemcachedStore(options);

  if (typeof options === 'string') options = {uri: options};
  if (! options || ! options.uri)
    throw new Error("Must pass a memcached connection string or an option object with at least a `uri` property.");

  this.lifetime = options.maxAge && options.maxAge >= 1000 ? parseInt(options.maxAge/1000) : 60;

  // TODO: fix timeout connection not firing!!!
  this.mc = new MemcachedStore.Memcached(options.uri, {namespace: options.ns || '', timeout: options.timeout || 1000});
}

MemcachedStore.Memcached = Memcached;

MemcachedStore.prototype.set = function (key, value) {
  return this.mc.set.sync(this.mc, key, value, this.lifetime);
};

MemcachedStore.prototype.get = function (key) {
  return this.mc.get.sync(this.mc, key) || void 0;
};

MemcachedStore.prototype.del = function (key) {
  return this.mc.del.sync(this.mc, key);
};

MemcachedStore.prototype.has = function (key) {
  return true;
};

MemcachedStore.prototype.peek = MemcachedStore.prototype.get;
MemcachedStore.prototype.reset = function () {};
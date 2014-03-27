describe('MemcachedStore', function () {

  var uri = 'localhost:11211'
    , sandbox
    ;

  describe('Unit Tests', function () {
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('#new', function () {
      it('connects to memcached with the uri string', function () {
        var Memcached = sandbox.spy();
        var MC = require('../sync-memcached-store');
        MC.Memcached = Memcached;
        new MC(uri);
        Memcached.should.have.been.calledWithNew;
        Memcached.should.have.been.calledWith(uri);
      });

      it('initializes namespace and timeout', function () {
        var Memcached = sandbox.spy();
        var MC = require('../sync-memcached-store');
        MC.Memcached = Memcached;
        new MC({uri: uri, timeout: 60, ns: 'foo'});
        Memcached.should.have.been.calledWithNew;
        Memcached.should.have.been.calledWith(uri, {namespace: 'foo', timeout: 60});
      });

      it('throws an error if no uri is passed', function () {
        var Memcached = sandbox.spy();
        var MC = require('../sync-memcached-store');
        MC.Memcached = Memcached;
        var initFn = function () { return new MC };
        expect(initFn).to.throw();
        Memcached.should.not.have.been.calledWithNew;
      });

      it('sets the default key lifetime', function () {
        var Memcached = sandbox.spy();
        var MC = require('../sync-memcached-store');
        MC.Memcached = Memcached;
        var mc = new MC(uri);
        Memcached.should.have.been.calledWithNew;
        mc.lifetime.should.be.greaterThan(0);
      });

      it('sets the configured key lifetime', function () {
        var Memcached = sandbox.spy();
        var MC = require('../sync-memcached-store');
        MC.Memcached = Memcached;
        var mc = new MC({uri: uri, maxAge: 3600000});
        Memcached.should.have.been.calledWithNew;
        mc.lifetime.should.be.equal(3600);
      });
    });

    describe('#set', function () {
      it('sets the value of the key', function () {
        var spy = sandbox.spy(), mock = { set: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.set('key', 'value');
        spy.should.have.been.calledWith(mock, 'key', 'value');
      });

      it('sets the value of the key with configured lifetime', function () {
        var spy = sandbox.spy(), mock = { set: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC({uri: uri, maxAge: 3600000});
        mc.set('key', 'value');
        spy.should.have.been.calledWithExactly(mock, 'key', 'value', 3600);
      });
    });

    describe('#get', function () {
      it('gets the value for the key', function () {
        var spy = sandbox.spy(), mock = { get: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.get('key');
        spy.should.have.been.calledWith(mock, 'key');
      });

      it('gets the value for the key', function () {
        var mock = { get: { sync: function () { return 'value' } } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.get('key').should.equal('value');
      });

      it('returns undefined if no value is found for the key', function () {
        var mock = { get: { sync: function () { return null } } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        expect(mc.get('key')).to.equal(void 0);
      });
    });

    describe('#del', function () {
      it('deletes the key', function () {
        var spy = sandbox.spy(), mock = { del: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.del('key');
        spy.should.have.been.calledWith(mock, 'key');
      });
    });

    describe('#peek', function () {
      it('gets the value for the key', function () {
        var spy = sandbox.spy(), mock = { get: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.peek('key');
        spy.should.have.been.calledWith(mock, 'key');
      });
    });

    describe('#has', function () {
      it('always returns true', function () {
        var spy = sandbox.spy(), mock = { get: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.has('key').should.be.true;
        spy.should.not.have.been.called;
      });
    });

    describe('#reset', function () {
      it('does nothing', function () {
        var spy = sandbox.spy(), mock = { del: { sync: spy } };
        var MC = require('../sync-memcached-store');
        MC.Memcached = function () { return mock };
        var mc = new MC(uri);
        mc.reset();
        spy.should.not.have.been.called;
      });
    });
  });

  describe('Integration Tests', function () {
    var MC = require('../sync-memcached-store'), Sync = require('syncho');
    it('returns value from memcached', function () {
      Sync(function () {
        var mc = new MC(uri);
        expect(mc.get('key')).to.equal(void 0);
        mc.set('key', 'value');
        mc.get('key').should.equal('value');
      });
    });

    it('deletes value from memcached', function () {
      Sync(function () {
        var mc = new MC(uri);
        mc.set('key', 'value');
        mc.del('key').should.be.true;
        expect(mc.get('key')).to.equal(void 0);
      });
    });
  });
});

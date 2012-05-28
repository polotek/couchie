(function (window) {

  var uuid = function b (a) {
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)
  }
  
  function Couchie (name) {
    if (name.indexOf('__') !== -1) throw new Error('Cannot have double underscores in name')
    this.name = name
    this._prefix = '_couchie__'+name+'__'
  }
  Couchie.prototype = new Storage()
  Couchie.prototype.clear = function (cb) {
    if (this.has('_revs')) {
      for (var i in this.revs()) {
        this.del(i)
      }
      this.del('_revs')
      setTimeout(cb, 0)
    } else {
      setTimeout(cb, 0)
    }
      
  }
  Couchie.prototype.post = function (obj, cb) {
    if (!obj._id || !obj._rev) return cb(new Error('Document does not have _id or _rev.'))
    var revs = this.revs()
    this.set(obj._id, obj)
    revs[obj._id] = obj._rev
    this.setrevs(revs)
    cb(null)
  }
  Couchie.prototype.bulk = function (docs, cb) {
    var revs = this.revs()
    for (var i=0;i<docs.length;i++) {
      var obj = docs[i]
      if (!obj._id || !obj._rev) return cb(new Error('Document does not have _id or _rev.'))
      this.set(obj._id, obj)
      revs[obj._id] = obj._rev
    }
    this.setrevs(revs)
    cb(null)
  }
  Couchie.prototype._get = Couchie.prototype.get;
  Couchie.prototype.get = function (id, cb) {
    var doc = this._get(id)

    // the Storage lib calls get() without a cb
    if(typeof cb !== 'function') { return doc; }

    if (!doc) return cb(new Error('No such doc.'))
    cb(null, doc)
  }
  Couchie.prototype.all = function (cb) {
    var self = this
    var revs = self.revs()
    cb(null, Object.keys(revs).map(function (id) {return self._get(id)}))
  }
  
  Couchie.prototype.revs = function () {
    return this._get('_revs') || {}
  }
  Couchie.prototype.setrevs = function (obj) {
    this.set('_revs', obj)
  }
  
  window.couchie = function (name) { return new Couchie(name) }
}(window));

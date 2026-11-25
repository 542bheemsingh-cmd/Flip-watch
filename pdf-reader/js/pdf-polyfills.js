/*
 * Polyfills for the newer JavaScript APIs that pdf.js v6 relies on.
 * Without these, pdf.js throws errors like
 *   "this.#methodPromises.getOrInsertComputed is not a function"
 * on Safari/WebKit and older Chromium/Firefox, leaving blank pages.
 *
 * This file is loaded before pdf.js on the page, and its contents are also
 * prepended to vendor/pdf.worker.js (a worker has its own global scope).
 */
(function () {
  var mapProto = Map.prototype;
  if (typeof mapProto.getOrInsert !== "function") {
    mapProto.getOrInsert = function (key, value) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
    };
  }
  if (typeof mapProto.getOrInsertComputed !== "function") {
    mapProto.getOrInsertComputed = function (key, callbackfn) {
      if (!this.has(key)) this.set(key, callbackfn(key));
      return this.get(key);
    };
  }

  if (typeof Promise.withResolvers !== "function") {
    Promise.withResolvers = function () {
      var resolve;
      var reject;
      var promise = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
      });
      return { promise: promise, resolve: resolve, reject: reject };
    };
  }

  var setProto = Set.prototype;
  if (typeof setProto.union !== "function") {
    setProto.union = function (other) {
      var result = new Set(this);
      other.forEach(function (value) { result.add(value); });
      return result;
    };
  }
  if (typeof setProto.intersection !== "function") {
    setProto.intersection = function (other) {
      var result = new Set();
      this.forEach(function (value) { if (other.has(value)) result.add(value); });
      return result;
    };
  }
  if (typeof setProto.difference !== "function") {
    setProto.difference = function (other) {
      var result = new Set();
      this.forEach(function (value) { if (!other.has(value)) result.add(value); });
      return result;
    };
  }
  if (typeof setProto.symmetricDifference !== "function") {
    setProto.symmetricDifference = function (other) {
      var result = new Set();
      var self = this;
      this.forEach(function (value) { if (!other.has(value)) result.add(value); });
      other.forEach(function (value) { if (!self.has(value)) result.add(value); });
      return result;
    };
  }
  if (typeof setProto.isSubsetOf !== "function") {
    setProto.isSubsetOf = function (other) {
      var ok = true;
      this.forEach(function (value) { if (!other.has(value)) ok = false; });
      return ok;
    };
  }
  if (typeof setProto.isSupersetOf !== "function") {
    setProto.isSupersetOf = function (other) {
      var self = this;
      var ok = true;
      other.forEach(function (value) { if (!self.has(value)) ok = false; });
      return ok;
    };
  }
  if (typeof setProto.isDisjointFrom !== "function") {
    setProto.isDisjointFrom = function (other) {
      var ok = true;
      this.forEach(function (value) { if (other.has(value)) ok = false; });
      return ok;
    };
  }

  if (typeof Array.prototype.at !== "function") {
    Array.prototype.at = function (index) {
      var i = Math.trunc(index) || 0;
      if (i < 0) i += this.length;
      return i < 0 || i >= this.length ? undefined : this[i];
    };
  }

  if (typeof Object.groupBy !== "function") {
    Object.groupBy = function (items, callbackfn) {
      var result = Object.create(null);
      var index = 0;
      var iterable = items[Symbol.iterator] ? items : Array.from(items);
      for (var item of iterable) {
        var key = callbackfn(item, index++);
        if (!result[key]) result[key] = [];
        result[key].push(item);
      }
      return result;
    };
  }

  if (typeof Array.fromAsync !== "function") {
    Array.fromAsync = async function (items) {
      var out = [];
      for await (var item of items) out.push(item);
      return out;
    };
  }
})();

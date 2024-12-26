function ListCache(entries) {
  let index = -1;
  let length = entries == null ? 0 : entries.length;

  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

ListCache.prototype.clear = function () {};

ListCache.prototype.get = function () {};

ListCache.prototype.set = function () {};

ListCache.prototype.delete = function () {};

ListCache.prototype.has = function () {};

/**
 * 最大栈
 */
let LARGE_ARRAY_SIZE = 200;

function Stack() {
  let data = (this.__data__ = new ListCache());

  this.size = data.size;
}

// Stack 的原型方法本质都是上面 ListCache 的原型方法； 因为都是在 __data__ 上面调用的

/**
 * 清空栈
 */
Stack.prototype.clear = function () {
  this.__data__ = new ListCache();
  this.size = 0;
};

Stack.prototype.delete = function (key) {
  let data = this.__data__;

  let reuslt = data['delete'](key);

  this.size = data.size;

  return reuslt;
};

Stack.prototype.get = function (key) {
  return this.__data__.get(key);
};

Stack.prototype.set = function (key, value) {
  let data = this.__data__;

  if (data instanceof ListCache) {
    let pairs = data.__data__;

    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);

      this.size = ++data.size;

      return this;
    }
  }

  data.set(key, value);

  this.size = data.size;
  return this;
};

Stack.prototype.has = function (key) {
  return this.__data__.has(key);
};

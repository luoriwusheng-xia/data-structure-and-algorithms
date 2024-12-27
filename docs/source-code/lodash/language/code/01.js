function ListCache(entries) {
  let index = -1;
  // 如果 entries 没传，那么 == null 就是true, 第一次的 length = 0
  let length = entries == null ? 0 : entries.length;

  // 从上面看都没有 __data__ 属性和size 其实都是在 clear 上面添加的
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * 这里不仅是清空数据，还有 Class中 constructo 初始化的作用
 * 从缓存中移除所有的 key-value 对象
 */
ListCache.prototype.clear = function () {
  this.__data__ = [];
  this.size = 0;
};

ListCache.prototype.get = function (key) {
  let data = this.__data__;

  let index = assocIndexOf(data, key);

  // 如果没有找到，就返回 undefined; 如果找到了，则取的是数组的 [1], 因为这里面本质存放的是未来 set进来的对象， [key， value-实际要比对的对象]
  // ['']
  return index < 0 ? undefined : data[index][1];
};

ListCache.prototype.set = function () {};

ListCache.prototype.delete = function () {};

ListCache.prototype.has = function () {};

/**
 * 最大栈
 */
let LARGE_ARRAY_SIZE = 200;

/**
 * 创建一个栈
 *
 * 栈里面的 __data__ 跟 ListCache 中的__data__ 本质不是一个东西，但是值在初始化的时候是一样的 []
 * Stack 里面的 this.__data__ 是ListCache 实例；
 * 是ListCache 中的__data__ 是属性
 */
function Stack() {
  // 这里就是一个栈，里面就是一个 有私有属性 __data__ 数组+ size的 实例
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

/**
 * this.__data__ 是 ListCache 实例，所以不要搞混淆了。 调用的get方法，本质就是 new ListChache().get
 * @param {*} key
 * @returns
 */
Stack.prototype.get = function (key) {
  return this.__data__.get(key);
};

/**
 *
 * @param {*} key
 * @param {*} value
 * @returns
 */
Stack.prototype.set = function (key, value) {
  // 拿出 ListCache 实例， 这里一定不要理解为一个空数组
  let data = this.__data__;

  // 是ListCache的实例下
  if (data instanceof ListCache) {
    // 这里才是 数组
    let pairs = data.__data__;

    // 忽略 !Map， 这在现代浏览器是支持 Map数据结构的
    // 数组中个数小于最大的限定阈值 200
    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      // 这里key就是原始的对象， value 上面 initCloneByTag 各种初始化的 类型，一开始都是空的，后面在挨个添加的value下面的属性
      pairs.push([key, value]);

      // 自增属性的个数
      this.size = ++data.size;

      // 一般普通的对象，到这里就返回了就返回上一层调用栈了

      // 支持链式调用， 比如 set, get ，has等
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

/**
 * 在数组中找到那个对应的key 的索引
 * @param {*} array
 * @param {*} key
 * @returns
 */
function assocIndexOf(array, key) {
  let length = array.length;

  while (length--) {
    if (eq(array[length][0], key)) {
      // 返回对应的索引
      return length;
    }
  }

  // 没找到相同的
  return -1;
}

/**
 * 全等的判断
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * 判断2个对象 是不是全等的
 * _.eq(object, object);
 * // => true
 *
 * 引用不一样，虽然属性一样，不全等
 * _.eq(object, other);
 * // => false
 *
 * 判断字符串相等
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  // === 先判断是否严格相等
  // (value!== value && other!== other) 这部分是对 NaN 的特殊处理。在 JavaScript 中，NaN 是一个特殊的值，它的特性是 NaN!== NaN。所以如果 value 是 NaN 并且 other 也是 NaN，则 value!== value 和 other!== other 都为 true，函数将返回 true，因为在某些情况下，我们可能希望将两个 NaN 值视为相等。
  return value === other || (value !== value && other !== other);
}

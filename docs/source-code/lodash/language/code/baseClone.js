function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
    isDeep = bitmask & CLONE_DEEP_FLAG,
    isFlat = bitmask & CLONE_FLAT_FLAG,
    isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }

  // 如果是基础类型， _.clone(2), 直接返回 2

  // 如果是基础类型 和 null ， 直接返回
  if (!isObject(value)) {
    return value;
  }

  var isArr = isArray(value);
  if (isArr) {
    // 初始化一个空的数组
    result = initCloneArray(value);

    // 浅拷贝-数组
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    // 对象的克隆， 包括 Set, Map, WeakSet, WeakMap， {}

    // tag 本质拿到的就是 类型的 toString 结果， 例如：Object.prototype.toString.call(); // '[object Undefined]'
    var tag = getTag(value);

    // 判断是否为普通函数 以及是 generator函数
    var isFunc = tag == funcTag || tag == genTag;

    // 浏览器环境没有这个， node 环境有
    if (isBuffer(value)) {
      // node中克隆 buffer, 本质就是 拿到 length， 初始化一个空buffer (类似于上面数组的初始化过程), 调用 copy 方法，把value拷贝过来
      return cloneBuffer(value, isDeep);
    }

    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      // result 本质是拿到一个空对象； 如果是函数就直接变为一个空对象
      result = isFlat || isFunc ? {} : initCloneObject(value);

      // 如果是普通对象的话, 这里不是深拷贝，就进入这个逻辑
      if (!isDeep) {
        // 浅拷贝，下面本质都是 for循环， 初始化一个空对象， 把key，value 挨个拷贝，然后返回

        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : // result 本质是拿到一个空对象, value就是我们要拷贝的值
            // baseAssign(result, value) 需要查看下面的讲解
            copySymbols(value, baseAssign(result, value));
      }
    } else {
      // 对于不可克隆的类型，根据是否存在对象返回原对象或空对象
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }

      // 根据对象的类型标签进行初始化克隆
      result = initCloneByTag(value, tag, isDeep);
    }
  }

  // 创建一个缓存栈， 如果栈里面有这个引用对象，则直接返回，避免循环引用的问题导致死循环
  // 这一块的逻辑，从 01.js中取看详细的解释
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack());

  var stacked = stack.get(value);
  // 如果拿到了引用，说明是循环引用，直接返回这个引用对象即可
  if (stacked) {
    return stacked;
  }

  // 如果不是循环引用，则 stacked 是undefined ，走这里
  // value 比如是  外部的对象，比如 {age: 1}, result 默认看上面初始化是什么就是什么； 如果value是一个普通对象，则result = {}初始的就是一个空对象， 这个对象在 深层对象的 clone 拷贝过程中，是都要全程传递的
  stack.set(value, result);

  // 拷贝Set
  if (isSet(value)) {
    value.forEach(function (subValue) {
      // result一开始都是空的，现在遍历挨个将value拷贝到result里面去；
      // clone和deepClone 本质只有2个参数 也就是 subValue, bitmask； 深拷贝有 stack
      result.add(
        baseClone(subValue, bitmask, customizer, subValue, value, stack)
      );
    });
  } else if (isMap(value)) {
    // Map的拷贝
    value.forEach(function (subValue, key) {
      result.set(
        key,
        baseClone(subValue, bitmask, customizer, key, value, stack)
      );
    });
  }

  // 这里的三目运算比较恶心，展开就是
  // var keysFunc = isFull
  //   ? isFlat
  //     ? getAllKeysIn
  //     : getAllKeys
  //   : isFlat
  //   ? keysIn
  //   : keys;

  var keysFunc;
  // 深拷贝， isFull 就是 4
  if (isFull) {
    // 深拷贝 isFlat = 0； 所以走 getAllKeys 方法
    keysFunc = isFlat ? getAllKeysIn : getAllKeys;
  } else {
    keysFunc = isFlat ? keysIn : keys;
  }

  // 如果是对象，则这里直接调用 keysFunc(value) ，其实就是调用  getAllKeys(value)
  var props = isArr ? undefined : keysFunc(value);

  // 这里 props 就已经是 ['a', 'b'] 属性集合的keys了

  // arrayEach 其实就是数组的实现，不过内部使用 while实现了, 其实就是内部将rFn 逐步调用了一下，然后参数的顺序就自己包装定义
  // (props || value).forEach(...)

  // subValue 其实是值， 就是 forEach 函数中的 值， key其实就是 forEach里面的 index, 它这里依旧遵循了原生forEach的参数顺序
  arrayEach(props || value, function rFn(subValue, key) {
    if (props) {
      // 对象的属性key， 比如 a, b
      key = subValue;
      // 拿到value, 比如 {a: 1, b: 2}, 这里 value[key] 就是属性值, 1 ,2这种
      subValue = value[key];
    }

    // 这里就是拷贝，数组，普通对象都走这里， 然后递归调用 baseClone
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(
      result,
      key,
      baseClone(subValue, bitmask, customizer, key, value, stack)
    );
  });
  return result;
}

/**
 * object 初始化的对象
 * source 原始对象，要拷贝的对象
 */
function baseAssign(object, source) {
  // keys(source) 是拿到对象所有的key , 返回一个数组 ['name', 'age', '....']
  return object && copyObject(source, keys(source), object);
}

/**
 * source 源目标对象
 * props:  原目标对象的 属性组成的数组
 * object: 要拷贝到新目标对象上
 * customizer 是自定义拷贝函数， _.clone 是在这里是 undefined, 没有传递
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
    length = props.length;

  // 挨个遍历
  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      // 普通对象拷贝属性
      assignValue(object, key, newValue);
    }
  }
  return object;
}

function assignValue(object, key, value) {
  // 先拿到object 对应属性的值， 如果这个值跟现在要拷贝的值 value 是一样的
  var objValue = object[key];
  // 属性不在目标对象上， 且也 目标对象的key的值  跟要拷贝过来的值夜不等
  if (
    !(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
    (value === undefined && !(key in object))
  ) {
    baseAssignValue(object, key, value);
  }
}

function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      value: value,
      writable: true,
    });
  } else {
    // 普通的属性，直接赋值新值到 目标对象上。
    // 如果是循环引用，这里也直接拷贝上
    object[key] = value;
  }
}

/**
 * 拿到对象上可枚举的属性和 symbol属性, 并返回为一个数组
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  // 这里的keys 和 getSymbols  都是方法； 真正调用都是在 baseGetAllKeys 里面调用执行的
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  // baseKeys(object) 其实就是  Object.keys(object) 拿到keys 数组

  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * lodash 还有各种兼容，下面直接用最简单的实现
 * @param {*} object
 * @returns
 */
function getSymbols(object) {
  // 现代浏览器支持的获取Symbol属性的方法
  return Object.getOwnPropertySymbols(object);
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  // 这里result 已经是 ['a', 'b'] 拿到可枚举的属性了
  var result = keysFunc(object);
  //  symbolsFunc(object) 再返回 所有 symbol 组成的 属性数组
  // arrayPush 做的事情就是 合并2个数组， 简化实现就是 r1 = result.concat(r2)

  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 *
 * 判断是否为函数
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);

  // 主要就是下面几种情况，普通函数， generator函数， async函数， proxy函数
  // return tag === '[object Function]'
  // tag === "[object generator function]"
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

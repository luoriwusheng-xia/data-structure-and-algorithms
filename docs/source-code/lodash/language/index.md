# 语言

## castArray

> 如果 value 不是数组, 那么强制转为数组。

```js
_.castArray(1);
// => [1]

_.castArray({ a: 1 });
// => [{ 'a': 1 }]

_.castArray('abc');
// => ['abc']

_.castArray(null);
// => [null]

_.castArray(undefined);
// => [undefined]

_.castArray();
// => []

var array = [1, 2, 3];
console.log(_.castArray(array) === array);
// => true
```

内部实现比较简单

- 当什么都没传，返回空数组
- 因为只针对一个参数，如果传递多个，忽略
- 判断是否是数组，是数组，则直接返回本身， 不是，则包一层

```js
function castArray() {
  if (!arguments.length) {
    return [];
  }
  var value = arguments[0];
  return Array.isArray(value) ? value : [value];
}
```

## clone

### 基础使用

::: code-group

```js [数组]
let arr = [1, 2, 3];
let b = _.clone(arr);
b === arr; // false
```

```js [基础类型]
let c1 = 12;
let c2 = _.clone(c1);

console.log(c1 === c2); // true
```

```js [正则]
// 这个场景比较少
let array = /c/.exec('abcde');
let array2 = _.clone(array);
console.log(array === array2); // false
```

```js [拷贝对象]
var objects = [{ a: 1 }, { b: 2 }];

var shallow = _.clone(objects);
console.log(shallow[0] === objects[0]); // => true , 说明是浅拷贝
```

:::

### 掩码

lodash 通过 二进制 & 判断是否深拷贝

```js
var CLONE_DEEP_FLAG = 1,
  CLONE_FLAT_FLAG = 2,
  CLONE_SYMBOLS_FLAG = 4; // 浅拷贝

function clone(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG);
}
```

### 通用的拷贝方法

[深浅拷贝-大纲](https://www.yuque.com/zhile-fk0gg/kb/sdfixb#zeLm7)

> 源码逐行分析

```js
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
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
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

  var keysFunc = isFull
    ? isFlat
      ? getAllKeysIn
      : getAllKeys
    : isFlat
    ? keysIn
    : keys;

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
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
```

```js
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
```

- 浅拷贝，是没有深度递归查看对象的值， 所以值拿最外面一层的， 从上面的代码分析也是这样实现的， 直接在 `copyObject` 方法中 调用 `assignValue(object, key, newValue)` 就返回了

### 初始化一个空数组

```js
function initCloneArray(array) {
  var length = arr.length;
  // 本质就是  new Array(4)
  var result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  //  这块处理正则的场景
  // 例如： let array = /c/.exec('abcde'), 这时候， array 返回的是 [ 'c', index: 2, input: 'abcde', groups: undefined ]

  if (
    length &&
    typeof array[0] == 'string' &&
    hasOwnProperty.call(array, 'index')
  ) {
    // 所以。数组的第一个元素是字符串，且包含 index 属性
    result.index = array.index;
    result.input = array.input;
  }

  // 返回的是一个 空数组， 或者空的正则对象执行后的数组
  return result;
}
```

### 拷贝数组

```js
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
    length = source.length;

  // 这里 array 可以不传，不传递，其实就是 new Array(length) 初始化一个空数组
  array || (array = Array(length));
  while (++index < length) {
    // 就挨个复制一下
    array[index] = source[index];
  }
  return array;
}
```

### baseGetTag/getTag

> 拿到的其实是 字符串

```js
Object.prototype.toString.call(); // '[object Undefined]'
Object.prototype.toString.call(new Array(1)); // '[object Array]'
Object.prototype.toString.call(null); // '[object Null]'
```

```js
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  // symToStringTag 就是这个 Symbol.toStringTag， 取了一个变量名

  // 判断一下对象身上有没有 [Symbol.toStringTag] 这个属性， 如果有，则要删除掉，也就进入  getRowTag 逻辑， 因为这个属性改变的就是 toString的结果
  // 如果没有，则就是普通对象， 就拿到这个对象 toString的结果即可
  return symToStringTag && symToStringTag in Object(value)
    ? getRawTag(value)
    : objectToString(value);
}
```

### getRawTag

```js
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  // 使用 hasOwnProperty 方法检查 value 是否自身拥有 symToStringTag 属性。symToStringTag 通常是 Symbol.toStringTag，用于自定义对象的 toString 行为。
  var isOwn = hasOwnProperty.call(value, symToStringTag),
    tag = value[symToStringTag];

  try {
    // 尝试将 value 的 symToStringTag 属性设置为 undefined，并设置 unmasked 为 true
    // 这里使用 try...catch 是因为有些对象可能不允许修改其 symToStringTag 属性，比如一些内置对象或者通过代理设置为不可写的对象。

    /**
     *  这里主要是用来屏蔽对象上有  Symbol.toStringTag 属性， 因为这个属性可以重写值，导致 toString 的结果不准确
     * let myObj = { [Symbol.toStringTag]: 'MyCustomObject' };
        console.log(myObj.toString());  // [object MyCustomObject]
     */
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  // nativeObjectToString 就是 Object.prototype.toString  , 这里拿到 value的 字符串结果
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
```

## cloneDeep

- 基础对象
- 数组， 深度嵌套数组
- Map
- Set
- Symbol 处理
- 函数
- 循环引用

### 根据 toStringTag 来判断不同的克隆方法

::: code-group

```js [initCloneByTag]
/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    // arrayBufferTag 其实就是  '[object ArrayBuffer]'
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    // 布尔类型和日期类型的，这里value本质是 Boolean(1), Date(xxx) 这种 包装后的对象
    case boolTag:
    case dateTag:
      // 直接调用构造函数，重新生成一个即可; 注意：这里使用+， 进行了类型转换
      // 如果是 Boolean(1)，+1 则变为 true,最终就是 new Boolean(true); Boolean(+"12121") --》 +"12121" 也是 true
      /**
       * 对于日期类型
       * let c = new Date()
       *
       * +c --》 1735205059509  就转换为从 1970 年 1 月 1 日以来的毫秒数， 时间戳
       * 这样做是为了确保深拷贝一个 Date 对象时，得到的是一个全新的 Date 对象，其日期和时间与原始 Date 对象相同，但不共享相同的引用。如果直接复制原始的 Date 对象，可能会出现引用问题，导致修改一个 Date 对象会影响另一个，而深拷贝的目的是创建完全独立的副本。
       *
       *
       * const _ = require('lodash');
        const originalBoolean = true;
        const originalDate = new Date();

        const deepClonedBoolean = _.cloneDeep(originalBoolean);
        const deepClonedDate = _.cloneDeep(originalDate);

        console.log(originalBoolean === deepClonedBoolean); // false
        console.log(originalDate === deepClonedDate); // false
       *
       */
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag:
    case float64Tag:
    case int8Tag:
    case int16Tag:
    case int32Tag:
    case uint8Tag:
    case uint8ClampedTag:
    case uint16Tag:
    case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      // Map 直接返回 new Map
      return new Ctor();

    case numberTag:
    case stringTag:
      // number 和 string类型，直接返回 new Number, new String
      return new Ctor(object);

    case regexpTag:
      // 正则的拷贝，几个关键点： new 正则的构造器，然后拿到原始对象的正则匹配模式 w,g,i等； 然后还有 正则的 lastIndex
      return cloneRegExp(object);

    case setTag:
      // Set的拷贝
      return new Ctor();

    case symbolTag:
      // Symbol 的拷贝；Symbol.prototype.valueOf.call(object)

      /**
       * const symbol = Symbol('uniqueKey');
       * 拿到新的Symbol 的 value
       * let symbolValueOf =  Symbol.prototype.valueOf.call(symbol)
          console.log(typeof symbolValueOf) // symbol
          console.log(symbolValueOf) // Symbol('uniqueKey')
      */

      /**
       * const _ = require('lodash');
        // 定义一个 Symbol
        const symbol = Symbol('uniqueKey');
        const originalObject = {
          [symbol]: 'value'
        };

        // 使用 Lodash 的 cloneDeep 进行深拷贝
        const clonedObject = _.cloneDeep(originalObject);

        console.log(originalObject[symbol]);
        console.log(clonedObject[symbol]);
       */
      return cloneSymbol(object);
  }
}
```

```js [cloneArrayBuffer]
/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  // node 环境的
  /**
   * const c = new Buffer([1,2,3]) // 得到 <Buffer 01 02 03>
   * c.length // 3
   *
   * const result = new c.constructor(3) // 创建一个新的buffer , 长度为3 ， Buffer 00 00 00
   *
   * result.set(new Uint8Array([12,3,4])) // 将 12,3,4 赋值给 result， 此时 reuslt 值就是 <Buffer 0c 03 04>
   *
   * return result // 已经实现了 buffer的拷贝
   */

  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}
```

```js [cloneDataView]
/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(
    buffer,
    dataView.byteOffset,
    dataView.byteLength
  );
}
```

```js [cloneRegExp]
/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  // 拿到构造器，然后拿到 正则的 flag
  // regexp.constructor 是 RegExp 构造函数，这里是利用了正则表达式对象的构造函数来创建一个新的正则表达式。
  // regexp.source 包含了正则表达式的模式部分，例如对于 /abc/，source 就是 'abc'。通过将原正则表达式的 source 作为新正则表达式的模式，保证了模式的复制。
  // lastIndex 是正则表达式的一个属性，它表示下一次匹配开始的位置。对于具有 g 标志的全局匹配的正则表达式，这个属性会在每次匹配后更新。将其复制到新的正则表达式对象中，确保新的正则表达式在使用时具有与原正则表达式相同的状态。
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

// 示例代码
const _ = require('lodash');

const originalRegex = /abc/gi;
originalRegex.lastIndex = 5;

const clonedRegex = _.cloneDeep(originalRegex);

console.log(originalRegex.source);
console.log(clonedRegex.source);
console.log(originalRegex.flags);
console.log(clonedRegex.flags);
console.log(originalRegex.lastIndex);
console.log(clonedRegex.lastIndex);
```

:::

### 判断循环引用

> 构建一个缓存栈

<<<./code/01.js

## isObject

判断目标值，是否为一个对象

```JS
 /**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;

  // 不为null 的 对象或者函数，就返回 true
  return value != null && (type == 'object' || type == 'function');
}


```

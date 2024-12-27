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

<<<./code/baseClone.js

- 浅拷贝，是没有深度递归查看对象的值， 所以值拿最外面一层的， 从上面的代码分析也是这样实现的， 直接在 `copyObject` 方法中 调用 `assignValue(object, key, newValue)` 就返回了

### 初始化一个空数组

<<<./code/initCloneArray.js

### 拷贝数组

::: code-group
<<<./code/copyArray.js
:::

### baseGetTag/getTag

> 拿到的其实是 字符串

```js
Object.prototype.toString.call(); // '[object Undefined]'
Object.prototype.toString.call(new Array(1)); // '[object Array]'
Object.prototype.toString.call(null); // '[object Null]'
```

<<<./code/baseGetTag.js

### getRawTag

<<<./code/getRawTag.js

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

<<<./code/initCloneByTag.js
<<<./code/cloneArrayBuffer.js

<<<./code/cloneDataView.js

<<<./code/cloneRegExp.js

:::

### 判断循环引用

> 构建一个缓存栈

<<<./code/01.js

### 获取 正则表达式的 flags

<<<./code/02.js

### 简易版深拷贝

<<<./code/03.js

### 函数深拷贝

函数一般是一个引用，是不需要深拷贝的，如果想实现，也是可以的

<<<./code/04.js

使用 eval 和 new Function 都有风险，他们会执行字符串代码

### 类数组判断/特征

- 有 length 属性， 比如 "abc" 字符串
- 正常数组 [1,2,3]
- document.body.children, 或者 arguments 对象

<<<./code/isArrayLike.js

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

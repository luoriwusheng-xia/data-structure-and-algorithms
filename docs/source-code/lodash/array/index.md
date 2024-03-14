# 数组

## castArray

## clone

### 基础使用

```js
let arr = [1, 2, 3]
let b = _.clone(arr)
b === arr // false
```

```js
let c1 = 12
let c2 = _.clone(c1)

console.log(c1 === c2); // true
```

这个场景比较少

```js
let array = /c/.exec('abcde')
let array2 = _.clone(array)
console.log(array === array2); // false
```

### 掩码

lodash通过 二进制 & 判断是否深拷贝

```js
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

function clone(value) {
    return baseClone(value, CLONE_SYMBOLS_FLAG);
}
```

有一个通用的拷贝方法

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
    if (!isObject(value)) {
        return value;
    }

    var isArr = isArray(value);
    if (isArr) {
        // 初始化一个空的数组
        result = initCloneArray(value);
        if (!isDeep) {
            return copyArray(value, result);
        }
    } else {
        // 对象的克隆， 包括 Set, Map, WeakSet, WeakMap， {}
        var tag = getTag(value),
            isFunc = tag == funcTag || tag == genTag;

        if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
            // result 本质是拿到一个空对象
            result = (isFlat || isFunc) ? {} : initCloneObject(value);

            // 如果是普通对象的话, 这里不是深拷贝，就进入这个逻辑
            if (!isDeep) {
                return isFlat ?
                    copySymbolsIn(value, baseAssignIn(result, value)) :
                    // result 本质是拿到一个空对象, value就是我们要拷贝的值

                    // baseAssign(result, value) 需要查看下面的讲解
                    copySymbols(value, baseAssign(result, value));
            }
        } else {
            if (!cloneableTags[tag]) {
                return object ? value : {};
            }
            result = initCloneByTag(value, tag, isDeep);
        }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
        return stacked;
    }
    stack.set(value, result);

    if (isSet(value)) {
        value.forEach(function(subValue) {
            result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
    } else if (isMap(value)) {
        value.forEach(function(subValue, key) {
            result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
    }

    var keysFunc = isFull ?
        (isFlat ? getAllKeysIn : getAllKeys) :
        (isFlat ? keysIn : keys);

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
        if (props) {
            key = subValue;
            subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
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

        var newValue = customizer ?
            customizer(object[key], source[key], key, object, source) :
            undefined;

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
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
    }
}

function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
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
    var length = arr.length
    // 本质就是  new Array(4)
    var result = new array.constructor(length)

    // Add properties assigned by `RegExp#exec`.
    //  这块处理正则的场景
    // 例如： let array = /c/.exec('abcde'), 这时候， array 返回的是 [ 'c', index: 2, input: 'abcde', groups: undefined ]

    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        // 所以。数组的第一个元素是字符串，且包含 index 属性
        result.index = array.index;
        result.input = array.input;
    }

    return result
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


### 判断循环引用

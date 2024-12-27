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

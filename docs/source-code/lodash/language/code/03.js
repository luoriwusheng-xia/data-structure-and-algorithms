function deepClone(obj, visited = new Map()) {
  // 基础类型或者null
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // 存在循环引用的时候，走这里，直接返回引用的对象
  if (visited.has(obj)) {
    return visited.get(obj);
  }

  let clone;

  if (Array.isArray(obj)) {
    clone = [];
  } else if (obj instanceof Date) {
    // 也可以参考 lodash 的  clone = new Date(+obj) , 也是将obj转换为 时间戳
    clone = new Date(obj.getTime());
  } else if (obj instanceof RegExp) {
    // 拿到正则的 source, 以及表达式
    clone = cloneRegExp(obj);
  } else if (obj instanceof Set) {
    clone = new Set();
    // 对于 Set Map的遍历要使用 for...of
    for (let item of obj) {
      clone.add(deepClone(item, visited));
    }
  } else if (obj instanceof Map) {
    clone = new Map();
    for (let [key, value] of obj) {
      clone.set(deepClone(key, visited), deepClone(value, visited));
    }
  } else {
    // 普通对象
    clone = {};
  }

  // 产生一个记录表，避免循环循环引用
  visited.set(obj, clone);

  // for... in 拷贝对象自身的可枚举属性

  // 上面虽然有 Set Map,但是 下面的 for... in 是不会遍历Set, Map, 所以上面对于Set,Map的拷贝已经完成； 下面只是拷贝普通对象
  // 由于for in 会遍历原型链上的属性或者方法， 所以下面要结合 hasOwnProperty 判断

  // 函数其实是没有拷贝的，只是把引用赋值给 clone， 函数本身是可复用的，不需要深拷贝
  // 数组的拷贝也是这里的
  for (let key in obj) {
    // 这里只拿 对象上的属性
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], visited);
    }
  }

  // 拷贝对象的 Symbol 属性
  let symbolKeys = Object.getOwnPropertySymbols(obj);
  for (let symbolKey of symbolKeys) {
    // 有可能有 Symbol 这个key对用的value 是对象等情况，所以需要再递归拷贝
    clone[Symbol(symbolKey.description)] = deepClone(obj[symbolKey], visited);
  }

  return clone;
}

function cloneRegExp(regexp) {
  const result = new regexp.constructor(regexp.source, copyRegExpFlags(regexp));
  result.lastIndex = regexp.lastIndex; // 复制 lastIndex 属性
  return result;
}

function copyRegExpFlags(regexp) {
  let flags = '';
  if (regexp.global) flags += 'g';
  if (regexp.ignoreCase) flags += 'i';
  if (regexp.multiline) flags += 'm';
  if (regexp.unicode) flags += 'u';
  if (regexp.sticky) flags += 'y';
  if (regexp.dotAll) flags += 's';
  return flags;
}

/**
 * 拷贝函数
 * @param {*} obj
 * @returns
 */
function copyFn(obj) {
  // 以下是一种可能的深拷贝函数的方式，但不推荐
  let functionString = obj.toString();
  return new Function('return' + functionString)();
}

let cFn = () => {
  console.log('cFn');
};
// 示例代码
let obj = {
  a: 1,
  fn: cFn,
};

let symbolKey = Symbol('key');
obj[symbolKey] = 'value';

obj.b = obj; // 形成循环引用

let clonedObj = deepClone(obj);
console.log(clonedObj);

console.log(clonedObj.fn === cFn); // true

console.log(cFn === copyFn(cFn)); // false

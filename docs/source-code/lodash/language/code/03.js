/**
 * 现代化语法写的深拷贝
 * @param {*} obj
 * @param {*} visited
 * @returns
 */
function deepClone(obj, visited = new Map()) {
  // 基础类型或者null
  if (typeof obj !== 'object' || obj === null) {
    // 函数其实走的这里，函数不需要拷贝，直接返回
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
      // map的key可能是一个深层对象， value也可能是，所以需要继续递归 ； visited 始终是一个有所有对象的引用，目的就防止 循环引用
      clone.set(deepClone(key, visited), deepClone(value, visited));
    }
  } else {
    // 普通对象
    clone = {};
  }

  // 产生一个记录表，避免循环循环引用
  visited.set(obj, clone);

  // for... in 拷贝对象自身的可枚举属性

  // 上面虽然有 Set Map,但是 下面的 for... in 是不会遍历Set, Map, 所以上面对于Set,Map的拷贝已经完成； 下面只是拷贝普通对象/数组
  // 由于for in 会遍历原型链上的属性或者方法， 所以下面要结合 hasOwnProperty 判断

  // 函数其实是没有拷贝的，只是把引用赋值给 clone， 函数本身是可复用的，不需要深拷贝
  // 数组，普通对象的拷贝也是这里的
  // for (let key in obj) {
  //   // 这里只拿 对象上的属性
  //   if (obj.hasOwnProperty(key)) {
  //     clone[key] = deepClone(obj[key], visited);
  //   }
  // }

  // 优化上面 for...in + hasOwnProperty
  Object.getOwnPropertyNames(obj).forEach((key) => {
    clone[key] = deepClone(obj[key], visited);
  });

  // 拷贝对象的 Symbol 属性
  let symbolKeys = Object.getOwnPropertySymbols(obj); // 返回Symbol key组成的 数组

  for (let symbolKey of symbolKeys) {
    let newKey = Symbol(symbolKey.description);
    // 有可能有 Symbol 这个key对用的value 是对象等情况，所以需要再递归拷贝
    clone[newKey] = deepClone(obj[symbolKey], visited);
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
  list: [1, 2, 3],
  set: new Set([1, 2, 3]),
  map: new Map([
    [
      {
        fuza: 'map复杂的key',
      },
      {
        age: '12',
        name: '张三',
      },
    ],
  ]),
};

let symbolKey = Symbol('key');
obj[symbolKey] = 'value';

obj.b = obj; // 形成循环引用

let clonedObj = deepClone(obj);
console.log(clonedObj);

console.log(clonedObj.fn === cFn); // true

console.log(cFn === copyFn(cFn)); // false

// [ 'a', 'fn', 'list', 'set', 'map', 'b' ] 拿到的都是对象身上自身的属性，不包含原型链上的
console.log('对象上所有属性的key： ', Object.getOwnPropertyNames(obj));
/**
 * for(let key in  obj) {
 *    if (obj.hasOwnProperty(key)) {
 *      ... 这里也是拿到对象自身的属性，不包含原型链上的
 *    }
 * }
 *
 * 跟 Object.getOwnPropertyNames 是一样的， 并且都不包含 symbole属性。
 *
 * 区别： Object.getOwnPropertyNames 【会】拿到对象上不可枚举的属性
 * for...in + hasOwnProperty ， 是 【不会】访问不可枚举属性
 */
// 这也表示上面的写法，是可以支持数组，普通对象的
console.log(Object.getOwnPropertyNames([1, 2, 3, 4])); // [ '0', '1', '2', '3', 'length' ]

function checkFunctionType(func) {
  // 可以用来获取对象的内部属性 [[Class]]，对于 Generator 函数，它会返回 [object GeneratorFunction]，以此来判断是否是 Generator 函数。
  if (Object.prototype.toString.call(func) === '[object GeneratorFunction]') {
      return 'Generator function';
  } else if (func.prototype === undefined) {
    // 箭头函数没有 prototype 属性，所以如果 func.prototype 为 undefined，可以判断为箭头函数。
      return 'Arrow function';
  } else if (func.constructor === Function) {
    // 普通函数的构造函数是 Function，所以如果满足此条件，可以判断为普通函数。
      return 'Normal function';
  } else {
      return 'Unknown function type';
  }
}

// 示例函数
function normalFunc() {}
const arrowFunc = () => {};
function* genFunc() {}

console.log(checkFunctionType(normalFunc));
console.log(checkFunctionType(arrowFunc));
console.log(checkFunctionType(genFunc));
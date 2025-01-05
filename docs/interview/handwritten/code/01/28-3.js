function checkFunctionType(func) {
  if (func instanceof GeneratorFunction) {
      return 'Generator function';
  } else if (func instanceof Function && func.prototype === undefined) {
      return 'Arrow function';
  } else if (func instanceof Function) {
      return 'Normal function';
  } else {
      return 'Unknown function type';
  }
}

// 为了使用 instanceof 判断 Generator 函数，需要获取 GeneratorFunction 构造函数
const GeneratorFunction = (function*(){}).constructor;

// 示例函数
function normalFunc() {}
const arrowFunc = () => {};
function* genFunc() {}

console.log(checkFunctionType(normalFunc));
console.log(checkFunctionType(arrowFunc));
console.log(checkFunctionType(genFunc));
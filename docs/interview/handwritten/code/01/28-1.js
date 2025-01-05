function checkFunctionType(func) {
  const funcString = func.toString();
  if (funcString.startsWith('function*')) {
      return 'Generator function';
  } else if (funcString.includes('=>')) {
      return 'Arrow function';
  } else if (funcString.startsWith('function')) {
      return 'Normal function';
  } else {
      return 'Unknown function type';
  }
}

// 示例函数
function normalFunc() {}
let f1 = function () {}
const arrowFunc = () => {};

function* genFunc() {}

console.log(checkFunctionType(normalFunc)); // Normal function
console.log(checkFunctionType(f1)); // Normal function
console.log(checkFunctionType(arrowFunc)); // Arrow function
console.log(checkFunctionType(genFunc)); // Generator function
// 实例.__ptoto__ === 构造函数.prototype
/**
 * 检测 参数1的原型 是参数2
 * @param {*} instance
 * @param {*} target
 * @returns
 */
function _instanceof (instance, target) {
  // 由于instance要检测的是某对象，需要有一个前置判断条件
  // 基本数据类型直接返回false
  if (typeof instance !== 'object' || instance == null) return false;
  let proto = Object.getPrototypeOf(instance); // 等价于 instance.__ptoto__

  while (proto) {
    // 当proto == null时，说明已经找到了Object的基类null 退出循环
    // 实例的原型等于当前构造函数的原型
    if (proto == target.prototype) return true;
    // 沿着原型链__ptoto__一层一层向上查
    proto = Object.getPrototypeof(proto); // 等价于 proto.__ptoto__
  }

  return false;
}

function Person() {}
let p = new Person()

console.log('null', _instanceof(null, Array)); // false
console.log('[]', _instanceof([], Array)); // true
console.log('空字符串', _instanceof('', Array)); // false
console.log('空对象 {}', _instanceof({}, Object)); // true
console.log('实例的原型', _instanceof(p, Person)) // true
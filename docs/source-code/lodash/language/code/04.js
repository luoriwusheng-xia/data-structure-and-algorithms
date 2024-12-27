/**
 * 方式1
 */
function c() {
  console.log(1);
}

// bind 本身会返回一个新函数， 这里将函数的 this 绑定到一个空对象上
// @link https://github.com/sodiray/radash/blob/master/src/object.ts 参见这里的实现
let d = c.bind({});

console.log(d === c); // false

/**
 * 方式2
 */
const copyFn = (obj) => {
  const functionToString = obj.toString();

  // 这里不执行，本身返回的就是一个函数
  console.log(typeof new Function(`return ${functionToString}`) === 'function'); // true
  /**
   * typeof 是指这里的匿名函数 anonymous
   * function anonymous() {
   *  return (name, age) => { ....}
   * }
   */

  return new Function(`return ${functionToString}`)();
};

const f1 = (age, name) => {
  console.log(`name: ${name}, age: ${age}`);
};

console.log(copyFn(f1) === f1); // false

// 执行这个【新函数】
copyFn(f1)(12, 2);

/**
 * 方式3
 */

let c = eval('(' + f1.toString() + ')');

console.log(c === f1); // false
c(12, '张三');

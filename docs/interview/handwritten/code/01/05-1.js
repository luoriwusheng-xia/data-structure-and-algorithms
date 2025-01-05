//实现call方法

// 相当于在obj上调用fn方法，this指向obj
// var obj = {fn: function(){console.log(this)}}
// obj.fn() fn内部的this指向obj
// call就是模拟了这个过程
// context 相当于obj

Function.prototype.myCall = function (context, ...args) {
  // 例如传入的context 为 "123" , 则 new Object('123') 跟 new String('123') 是一样的
  if (typeof context !== 'object' && context !== null) context = new Object(context); // 值类型，变为对象

  // 这里是判断 null的情况， 如果是 null,则取环境的全局对象为上下文
  context = context || (typeof window === 'undefined'? global : window);

  // args 传递过来的参数
  // this 表示调用call的函数fn
  // context 是call传入的this

  // 在context上加一个唯一值，不会出现属性名称的覆盖
  let fnKey = Symbol();
  // 相等于 obj[fnKey] = fn
  context[fnKey] = this; // this 就是当前的函数

  // 绑定了this
  let result = context[fnKey](...args); // 相当于 obj.fn()执行 fn内部this指向context(obj)

  // 清理掉 fn ，防止污染（即清掉obj上的fnKey属性）
  delete context[fnKey];

  // 返回结果
  return result;
};

//用法：f.call(this,arg1)
function f(a, b) {
  console.log(a + b);
  console.log(this.name);
}
let obj = {
  name: 1,
};
f.myCall(obj, 1, 2); // 不传obj，this指向window
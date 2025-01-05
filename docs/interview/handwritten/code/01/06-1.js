Function.prototype.myApply = function (context, args) {
  // 这里传参和call传参不一样
  // 例如传入的context 为 "123" , 则 new Object('123') 跟 new String('123') 是一样的
  if (typeof context !== 'object' && context !== null) context = new Object(context); // 值类型，变为对象

  // 这里是判断 null的情况， 如果是 null,则取环境的全局对象为上下文
  context = context || (typeof window === 'undefined' ? global : window);

  // args 传递过来的参数
  // this 表示调用call的函数
  // context 是apply传入的this

  // 在context上加一个唯一值，不会出现属性名称的覆盖
  let fnKey = Symbol();
  context[fnKey] = this; // this 就是当前的函数

  // 绑定了this
  let result = context[fnKey](...args);

  // 清理掉 fn ，防止污染
  delete context[fnKey];

  // 返回结果
  return result;
};

// 使用
function f (a, b) {
  console.log(a, b);
  console.log(this.name);
  console.log('this--->',this)
}
let obj = {
  name: '张三',
};
f.myApply(obj, [1, 2]);

f.myApply('', [1, 2]);
f.myApply(null, [1, 2]);
Promise.copyResolve = (param) => {
  // 传参为一个 Promise , 则直接返回它。
  if (param instanceof Promise) return param;

  return new Promise((resolve, reject) => {
    if (param && param.then && typeof param.then === 'function') {
      // param 状态变为成功会调用resolve，将新 Promise 的状态变为成功，反之亦然
      param.then(resolve, reject);
    } else {
      // 其他情况，直接返回以该值为成功状态的promise对象。
      // 比如 这里params 传入的 是基本类型
      resolve(param);
    }
  });
};

// 测试代码

// 原生case
let p1 = new Promise((resolve, reject) => {
  resolve('hello')
})

// 拥有then 方法的 对象
let p2 = {
  then: function(resolve, reject) {
    resolve('对象，具有 then方法')
  }
}

console.warn('原生案例')

Promise.resolve(p1).then(data => console.log('传入的是promise对象', data))
Promise.resolve(1).then(data => console.log('传入基本类型-结果--', data))
Promise.resolve(p2).then(data => console.log('thenable对象-结果--', data))

// 测试自己实现的方法

Promise.copyResolve(p1).then(data => console.log('copyResolve--传入的是promise对象', data))
Promise.copyResolve(1).then(data => console.log('copyResolve--传入基本类型-结果--', data))
Promise.copyResolve(p2).then(data => console.log('copyResolve--thenable对象-结果--', data))
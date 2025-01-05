// 区分 Node环境和 浏览器环境
let context =typeof window === 'undefined' ? global : window

console.log(context);

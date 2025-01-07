// 第二个宏任务
setTimeout(function() {
  console.log(1)
}, 0);


// 注意： 有这个一定是 node环境而不是浏览器环境
process.nextTick(function () {
  console.log(4) // 微任务
})

new Promise(function(resolve, reject) {
  console.log(2);  // 同步任务
  resolve()  // 同步任务
}).then(function() {
  console.log(3)  // 微任务
});

console.log(5) // 同步任务

// 执行顺序  2 --> 5 --> 3 --> 4 --> 1

// process.nextTick 跟 promise.then 执行时机跟网上说的似乎不一致， 按理说 process.nextTick 优先级高于 promise.then 实际是相反的
// node: 22 执行的结果

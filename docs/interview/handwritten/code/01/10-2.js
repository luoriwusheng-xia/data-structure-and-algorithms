Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

// 测试
let p1 = Promise.reject('测试错误')

p1.catch((err) => {
  console.log(err) // 测试错误
})
Promise.prototype.copyFinally = function (callback) {
  let resolveFn = (value) => {
    return Promise.resolve(callback()).then(() => {
      // 将then的值原封不动的往下传
      return value
    })
  }

  let rejectFn = (err) => {
    return Promise.reject(callback()).then(() => {
      return err
    })
  }

  // 当内部的then执行， 则会调用resolveFn或者rejectFn
  this.then(resolveFn, rejectFn)
}


// 原始版本
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000);
})

// p1
//   .then((data) => {
//     console.log(data)

//     return 'then返回的参数'
//   })
//   .finally(() => {
//     console.log('finally')
//   })


p1
  .then((data) => {
    console.log(data)
    return 'then返回的参数'
  })
  .then((t=> {
    console.log(t)
  }))
  .copyFinally(() => {
    console.log('finally')
  })
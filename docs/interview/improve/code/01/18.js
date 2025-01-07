console.log(1)

async function asyncFunc () {
  console.log(2)
  // await xx ==> promise.resolve(()=>{console.log(3)}).then()
  // console.log(3) 放到promise.resolve或立即执行
  await console.log(3)
  // 相当于把console.log(4)放到了then promise.resolve(()=>{console.log(3)}).then(()=>{
  //   console.log(4)
  // })
  // 微任务谁先注册谁先执行
  console.log(4)
}

setTimeout(() => { console.log(5) })

const promise = new Promise((resolve, reject) => {
  console.log(6)
  resolve(7)
})

promise.then(d => { console.log(d) })

asyncFunc()

console.log(8)

// 输出 1 6 2 3 8 7 4 5



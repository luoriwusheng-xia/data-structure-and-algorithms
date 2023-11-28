let str = `abcda`

// 使用展开运算符， 将str变成数组
let result = [...str].reduce((r, c) => {
  // 一开始r[c] 肯定是不存在， 不存在就是 r[c] 就是undefined
  if (r[c]) {
    r[c] ++
  } else {
    r[c] = 1
  }

  return r
}, {})

console.log(result);
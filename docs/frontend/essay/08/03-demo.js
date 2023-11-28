let str = `abcda`

let result = [...str].reduce((r, c) => {
  // 如果 r[c]一开始没有，就是undefined, 则 undefined ++ 就是 NaN, 就会走后面的赋值语句 r[c] = 1
  r[c]++ || (r[c] = 1)

  return r
}, {})

// console.log(result);

// 这里考察的就是 (exp1, exp2, exp3,...)  括号里面的表达式会挨个执行，最后返回 括号内最后一个值，既然有返回，就可以压缩使用箭头函数，默认返回值

let result2 = [...str].reduce((r, c) => {
  // 如果 r[c]一开始没有，就是undefined, 则 undefined ++ 就是 NaN, 就会走后面的赋值语句 r[c] = 1
  return (r[c]++ || (r[c] = 1), r)
}, {})


//  这种进一步压缩，省略了 return
let result3 = [...str].reduce((r, c) =>(r[c]++ || (r[c] = 1), r), {})

console.log(result3);

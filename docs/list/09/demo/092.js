function bf (n) {
  if (n < 2) return 0

  let count = 0

  for (let i = 2; i < n; i++) {
    count += isPrime(i) ? 1 : 0
  }

  return count
}

/**
 * 是否是素数
 *
 * 假设x = 12
 * 2 * 6 = 12
 * 3 * 4 = 12
 *
 * 4 * 3 = 12
 * 6 * 2 = 12
 *
 * 正常情况下， 如果有 x % i 取模， 则isPrime会遍历 x次， 其实只需要遍历一半，即可知道结果 - 是否为质数
 *
 * Math.sqrt(x) 根号x 遍历这么多就可以
 *
 * 假设 x = 11 , 11是质数， 但是需要遍历11 -1 次， 如果采用 Math.sqrt(11)  只需要遍历 约 3.3 次即可知道结果
 *
 * 下面根号不方便求值，则把 i 变成平方，是一个意思
 */
function isPrime (x) {
  console.log('入参', x);

  let i = 2

  for (; i< Math.sqrt(x); i++) {
    console.log('i', i);
    // 如果存在取模是整数，则不是素数
    if (x % i === 0) return false
  }

  if (i >= Math.sqrt(x)) {
    if (x % i === 0) return false
  }


  return true
}

let c1 = bf(10)

// let c2 = bf(100)

console.log('输入10： 输出：', c1);  // 4
// console.log('输入100： 输出：', c2); // 25

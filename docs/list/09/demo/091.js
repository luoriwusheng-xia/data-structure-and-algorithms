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
 */
function isPrime (x) {
  for (let i = 2; i < x; i++) {
    // 如果存在取模是整数，则不是素数
    if (x % i === 0) return false
  }

  return true
}

let c1 = bf(10)

let c2 = bf(100)

console.log('输入10： 输出：', c1);  // 4
console.log('输入100： 输出：', c2); // 25

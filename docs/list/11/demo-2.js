function isPalindrome(x) {
  if (x < 0) return false

  // 基础类型，先将原始值复制一份，作为目标对象
  let target = x

  let temp = 0

  // 将原始值进行翻转
  while(x) {
    // x % 10 = 拿到个位数
    temp = x % 10 + temp * 10

    // 一定要取整， 否则 x 可能变成无线小数
    x = Math.floor(x / 10)
  }

  return target === temp
}

console.log(isPalindrome(123)); // false
console.log(isPalindrome(121)); // true
console.log(isPalindrome(-121)); // false
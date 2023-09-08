var isPalindrome = function (x) {
  // 负数 一定不是
  if (x < 0) return false

  if (x === 0) true

  x = x.toString()

  let mid = parseInt(x.length / 2)

  // 只需要遍历到一半即可
  for (let i = 0; i < mid; i++) {
    if (x[i] !== x[x.length - 1 - i]) {
      return false
    }
  }

  return true
};

console.log(isPalindrome(123)); // false
console.log(isPalindrome(121)); // true
console.log(isPalindrome(-121)); // false
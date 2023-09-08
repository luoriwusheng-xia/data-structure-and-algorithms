function isPalindrome(x) {
  if (x < 0) return false

  return String(x) ===  String(x).split('').reverse().join('')
}


console.log(isPalindrome(123)); // false
console.log(isPalindrome(121)); // true
console.log(isPalindrome(-121)); // false
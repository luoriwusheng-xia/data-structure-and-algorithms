
/**
 * 暴力求解
 *
 * 时间复杂度： O(n^3)
 * 空间复杂度： O(1)  只用到了 几个临时变量
 */

/**
 * 验证是否为回文 子串
 */
const validPanlindromic = (charArray, left, right) => {
  while (left < right) {
    // 不是回文子串，直接返回
    if(charArray[left] !== charArray[right]) {
      return false
    }

    left++
    right--
  }

  return true
}


/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  let len = s.length

  // 字符串长度小于2， 一定一是一个回文子串， 例如： 's'
  if (len < 2) return s


  // 初始化最大回文串的长度，默认是1， 因为单个字符串，本身就是一个回文串， 所以初始长度从1开始； 假设整个字符串不是回文串，则字符串的【最大】回文串长度也是1
  let maxLen = 1
  let begin = 0

  // 这里其实可以不用split 因为下面的 validPanlindromic 中使用下标访问，字符串也是支持下标访问的 s[i]
  const charArray = s.split('')

  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      if (j - i + 1 > maxLen && validPanlindromic(charArray, i, j)) {
        maxLen = j - i + 1
        begin = i
      }
    }
  }

  return s.substring(begin, begin + maxLen )
};

let t1 = 'aba'

let t2 = 'abc'

let t3 = 'babad'
console.log(longestPalindrome(t1)); // aba
console.log(longestPalindrome(t2)); // a
console.log(longestPalindrome(t3)); // bab

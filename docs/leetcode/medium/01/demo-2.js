/**
 * 中心扩算法
 */

/**
 * @param {String} s
 */
function longestPalindrome (s) {
  if(s.length < 2) return s

  let begin = 0
  let maxLen = 0

  let len = s.length

  // 最后一个元素不需要枚举，所以是 len-1 因为，不可能向右边扩散 形成回文子串
  for (let i = 0; i < len - 1; i++) {
    let len1 = expandAroundCenter(s, i, i)
    let len2 = expandAroundCenter(s, i, i + 1)

    // 得到一个最大值
    let currentMax = Math.max(len1, len2)

    if (currentMax > maxLen) {
      maxLen = currentMax

      // 已知条件： 已经遍历到i这个元素（中心位置-奇/偶），也知道当前最大回文子串的长度 maxLen, 要求 这个回文子串的起点下标
      // 需要向下取整
      /**
       * i 中心点具有对称性， 当前遍历到哪个索引了， 减去一半的长度就是 起点位置
       *
       * 例如：
       * A A B B A C  回文串 ABBA   偶数
       * 0 1 2 3 4 5
       *
       * begin = 1
       * maxLen = 4
       * i = 2
       * i + 1 = 3
       *
       * begin = i - parseInt((4-1) / 2)
       * ----------------
       *
       * F A B C B A D    回文字符串 A B C B A   奇数
       * 0 1 2 3 4 5 6
       *
       * begin = 1
       * maxLen = 5
       * i = 3 (c 元素)
       */

      begin = i - parseInt((maxLen - 1) / 2)
    }
  }

  return s.substring(begin, begin + maxLen)
}

/**
 * 在当前点，朝2边扩散，寻找最大 回文子串， 不包含 left, 和right
 * @param {String} s
 * @param {number} left 起始点的 左边
 * @param {number} right 起始点的右边
 * @returns 回文字符串的长度， 返回的结果是不包含 left 和right
 */
function expandAroundCenter (s, left, right) {
  // 当 left = right  回文中心是1个字符， 回文串的长度就是 奇数
  // 当 right = left + 1 回文中心是2个字符， 回文串长度 就是 偶数

  while (left >= 0 && right < s.length) {
    // s[left] === s[right] 就是在中心点朝2边扩散，仍旧相等的条件
    if (s[left] === s[right]) {
      left--
      right++
    } else {
      // 遇到不相等的字符，不是回文，直接退出
      break
    }

  }

  // 当跳出 while循环的时候，刚好满足  s[left] !== s[right] 字符，也就是边界条件
  // 则此时回文字符串的长度就是  (right-left + 1) -2 = right-left-1
  // (right-left + 1) 是right距离left中间有多少个元素， 因为上面s[left] !== s[right] 所以，要剔除到左右2个元素，就是再 -2
  return right - left - 1
}


function f2 (s) {
  // 回文的最大长度是 (j - 1) - (i + 1) +1 = j-i-1  这就是下面的maxLen = right - left - 1
  let maxLen = 0
  let start = 0

  for (let i = 0; i < s.length; i++) {
    // 1: 以当前i这个数和 左侧的数字 之间的空隙作为对称中心点， 往两边扩散

    let left = i - 1
    let right = i

    // 左右寻找该回文的尽头
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--
      right++
    }

    if (right - left - 1 > maxLen) {
      // 看上面的maxLen的解释
      maxLen = right - left - 1

      // 右移1位
      start = left + 1
    }

    // 以这个数（i）作为对称中心点, 则这个数 i 左边就是 i-1, 右边就是i+1
    left = i - 1
    right = i + 1

    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--
      right++
    }


    if (right - left - 1 > maxLen) {
      maxLen = right - left - 1
      start = left + 1
    }

  }

  return s.substring(start, maxLen)
}

// 目前存在问题
// f2("babad") // aba
// f2('cbbd') // bb


console.log(longestPalindrome("akabbcdfbab")); // 偶数的情况  abbc
// console.log(longestPalindrome("babc"));
// console.log(longestPalindrome("ea"));
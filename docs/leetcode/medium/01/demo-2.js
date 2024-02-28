/**
 * 中心扩算法
 */

/**
 * @param {String} s
 */
function longestPalindrome (s) {
  // 空值
  if (s === null || s.length < 1) return ''


  let start = 0
  let end = 0

  let len = s.length

  for (let i = 0; i < len; i++) {
    let len1 = expandAroundCenter(s, i, i)
    let len2 = expandAroundCenter(s, i, i + 1)

    // 得到一个最大值
    let m = Math.max(len1, len2)

    if (m > end - start) {
      start = i - (m - 1) / 2
      end = i + len / 2
    }

  }

  return s.substring(start, end + 1)
}

/**
 * 在当前点，朝2边扩散，寻找最大 回文子串
 * @param {String} s
 * @param {number} left
 * @param {number} right
 * @returns
 */
function expandAroundCenter (s, left, right) {
  // s[left] === s[right] 就是在中心点朝2边扩散，仍旧相等的条件
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--
    right++
  }

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
f2('cbbd') // bb
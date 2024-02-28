/**
 * 动态规划
 *
 * 状态 dp[i][j] 表示 一个子串的  左边和右边  ， 从左侧开始第i个 和右边开始的第j 是相等的
 *
 * let s = 'ababa'
 *     s[0] = a  s[4] = a    则s[0][4] 是相等的
 *     s[1] = b  s[3] = b    s[1][3] 是一样的
 *     s[2] = a  s[2] = a    s[2][2] 是一样的
 *
 * 得到的状态转移方程就是：  dp[i][j] = (s[i] === s[j]) && dp[i+1][j-1]
 *
 * s[i] 跟s[j] 是一样的值， 表示左边的和右边的相等 s[0] == s[4]
 *
 * 还要分解的字符串也是   [i + 1] === [j-1]  相等， 就符合回文字符串的规则
 *
 * dp[i+1][j-1] 表示 一个字符串去掉左右2边的元素， 仍旧是一个相等，它就是回文
 *
 * 边界条件： (j-1)右边 - (i+1)左边 + 1 < 2  ， 右边 - 左边 + 1 表示还剩余的内容， 如果比2还小，则没有意义
 *      整理表达式 j - i +1 < 4   s[i...j] 长度为2或者3时，不用检查子串是否回文
 */

/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  let n = s.length

  // 长度为1的字符串，一定是回文字符串
  if (n < 2) return s

  let maxLen = 1
  let begin = 0

  // dp[i][j] 表示 字符串下标从i到j 是否为回文字符串

  let dp = []


  /**
   假设n = 4
    [
      [ true, false, false, false ],
      [ false, true, false, false ],
      [ false, false, true, false ],
      [ false, false, false, true ]
    ]
   */

  for (let i = 0; i < n; i++) {
    let arr2 = new Array(n)
    for (let j = 0; j < n; j++) {

      // 初始化所有字符长度为1的， 都是回文字符串; 想想， i=j 是不是类似于 i =2, j=2 2个循环指针在同一个元素上，那么就是这里的字符长度为1，就是回文字符串
      if (i === j) {
        arr2[j] = true
      } else {
        arr2[j] = false
      }
    }
    dp.push(arr2)
  }

  // console.log(dp);

  // 递推开始

  // 先枚举子串长度, 上面已经排除了子串长度为1的情况， 所以这里从2开始
  for (let sLen = 2; sLen <= n; sLen++) {
    //  i 代表从左开始枚举字符串
    for (let i = 0; i < n; i++) {
      // 本来长度应该是  j(右边的) - i(左边) + 1 = sLen； 转换一下， j = sLen + i - 1
      // 这个公式由左侧的索引，得到右侧的j的下标
      // 假设子串长度为 sLen ， 则我现在知道左侧枚举的索引了，就可以得到 字符串右侧的 j下标
      let j = sLen + i - 1

      // 如果右边越界了， 可以退出当前循环
      if (j >= n) {
        break
      }

      // 如果左右2侧的字符不相等，就不用考虑了， 不是回文字符串； 将这里标记为false
      if (s[i] !== s[j]) {
        dp[i][j] = false
      } else {
        // 走到这里： 如果 s[i] === s[j]  说明2个字符相等了

        // 假设 j-i<3  则表示剩余2个字符，且2个字符相等，那么一定是回文字符
        if (j - i < 3) {
          dp[i][j] = true
        } else {
          // 这里 dp[i][j] 是不是回文子串， 取绝于子串是不是回文，比如： abccba   则 dp[0][5] (abccba字符) 是不是回文，需要取决于 dp[1][4] bccb字符
          // 那么 dp[1][4]又取决于 dp[2][3] (cc)， cc是回文
          dp[i][j] = dp[i + 1][j - 1]
        }
      }

      // 上面遍历二位数组dp, 是从 数组对称线左上半部分开始遍历的， 下半部分不需要遍历

      // 如果d[i][j]为ture，则表示这个子串为回文， 那么将这中间的字符个数  j(右侧) - i(左侧) +1 就是回文字符的个数
      // maxLen是个数
      // 然后更新开始索引
      if (dp[i][j] && j - i + 1 > maxLen) {
        maxLen = j - i + 1
        begin = i
      }
    }
  }

  return s.substring(begin, begin + maxLen)
}

// console.log(longestPalindrome("abcd")); // a
console.log(longestPalindrome("abcddcba")); // abcddcba
// console.log(longestPalindrome("abccba")); // abccba
// console.log(longestPalindrome("abccde")); // cc
// console.log(longestPalindrome("abccbaff")); // abccba
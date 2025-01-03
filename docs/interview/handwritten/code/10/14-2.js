/**
 * 使用递归
 * 分治算法： 分治算法的核心思想是将一个大问题分解为几个较小的子问题，解决这些子问题，然后将子问题的解组合起来得到原问题的解。
 */

function longestCommonPrefixRecursive(strs) {
  // 首先，如果数组 strs 长度为 0，返回 ''
  if(strs.length === 0) return  ''

  // 如果长度为 1，返回该元素
  if (strs.length === 1) return strs[0]

  // 辅助函数，用于找出两个字符串的公共前缀
  function helper(str1, str2) {
    let i= 0

    while(i< str1.length && i<str2.length && str1[i] === str2[i]) {
      i++
    }

    return str1.slice(0, i)
  }

  // 前面已经判断了为一个元素的情况，这里strs 长度 >=2
  let prefix = helper(strs[0], strs[1])

  // 将 prefix 插入到数组中，并删除 strs[0] 和 strs[1], 因为 prefix 已经是找到了的2个元素的最长公共前缀
  // 剩下就是逐步进行递归 两两比较即可
  strs.splice(0, 2, prefix)

  // 递归， 这里其实就是延续上面两两比较的过程
  return longestCommonPrefixRecursive(strs)
}

// let arr = [11,22,3333, 444, 5555]

// console.log(arr.splice(0, 2, 17))
// console.log(arr);

let strs1 = ["flower","flow","flight"];
console.log(longestCommonPrefixRecursive(strs1)); // 输出 "fl"

let strs2 = ["dog","racecar","car"];
console.log('结果：',longestCommonPrefixRecursive(strs2)); // 输出 ""

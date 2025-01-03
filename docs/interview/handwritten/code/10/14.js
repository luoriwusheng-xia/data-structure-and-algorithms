/**
 * leetcode 官方给的 说法：水平扫描
 */
const longestCommonPrefix = function (strs) {
  // 首先，如果输入的数组 strs 长度为 0，直接返回空字符串 '
  if (strs.length === 0) return ''

  // 将 prefix 初始化为数组的第一个元素 strs[0]
  let prefix = strs[0];

  // 接着，遍历数组中的其他元素（从第二个元素开始）。
  for (let i = 1; i < strs.length; i++) {
    // 在遍历过程中，使用 while 循环，只要当前元素 strs[i] 不以 prefix 开头，就将 prefix 去掉最后一个字符。
      while (strs[i].indexOf(prefix) !== 0) {
        // 说明没有完全匹配到prefix 就需要做 prefix 缩短处理
          prefix = prefix.slice(0, prefix.length - 1);

          // 如果缩短为空字符串，说明传入的strs 没有相同的公共前缀
          if (prefix === '') return '';
      }
  }
  return prefix;
};

let strs1 = ["flower","flow","flight"];
console.log(longestCommonPrefix(strs1)); // 输出 "fl"

let strs2 = ["dog","racecar","car"];
console.log('结果：',longestCommonPrefix(strs2)); // 输出 ""
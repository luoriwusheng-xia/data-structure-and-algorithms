
/**
 * 归并排序-第二种实现
 * @param {number[]} nums1
 * @param {number[]} nums2
 *
 * 我们知道2个数组的个数，则他的中间位置的索引，其实是知道的
 * 所以 mid = (m + n) / 2
 *
 * 剩下就是分析 奇数，偶数讨论怎么取值问题
 */
const findMedianSortedArrays = (nums1, nums2) => {
  let m = nums1.length
  let n = nums2.length

  // 假设是 m + n + 1 = 11 , 11>> 1 = 5, 只有整数部分， 其实就是11/2 = 5

  // 如果nums1 和 nums2 个数相加是奇数， 则mid 是中间那个位置。如果是偶数， 则mid 是中间数字偏左的那个位置， 下一个需要mid + 1, 偶数其实是中间2个数字相加/2
  let mid = (m + n + 1) >> 1

  // i指针遍历 nums1
  let i = 0
  // j指针遍历 nums2
  let j = 0

  // 当前迭代了多少个值， 直到 count === mid  ，就是迭代到了中位数的位置
  let count = 0

  // 迭代的前一个值（如果是偶数，就需要 前一个 + 当前 ）/ 2
  let prev = 0
  // 当前迭代的值
  let cur = 0

  // 这里属于 归并排序的思路
  while (i < m || j < n) {
    // 如果第二个数组为空m  且左边不为空， 要求 第一个数组的数值要小于第二个，那么就把第一个数组的值取出来，给cur
    if (j === n || i < m && nums1[i] <= nums2[j]) {
      cur = nums1[i]
      i++
    } else {
      cur = nums2[j]
      j++
    }

    count++

    // 这里 & 其实是判断奇数，偶数的， 4 & 1 = 0 偶数， 5&1 = 1 奇数
    if (m + n & 1) {
      // 奇数情况下，直接返回cur 当前值，就是中位数
      if (count === mid) return cur
    } else {
      // 偶数的情况
      if (count === mid + 1) return (prev + cur) / 2
    }

    prev = cur
  }
}

console.log(findMedianSortedArrays([7], [2]));

// true || true && false 最终是 true
// true || false && true 最终是 true
// true || false && false 最终 true
// false || true && false 最终 false

// 这就是上面  if (j === n || i < m && nums1[i] <= nums2[j])  判断，应该从右往左进行计算， 先算 && 的结果，再算 || 的结果
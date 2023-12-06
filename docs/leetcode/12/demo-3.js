/**
 * 二分查找
 */

/**
 *
 * @param {Array<number>} nums1
 * @param {Array<number>} nums2
 * @param {Number} k
 */
const findMedianSortedArrays = (nums1, nums2) => {
  let total = nums1.length + nums2.length

  // 奇数
  if (total % 2 === 1) {
    let mid = Math.floor(total / 2)

    return getKthElement(nums1, nums2, mid + 1)
  } else {
    // 偶数， 偶数情况就有2个数， 则中位数的值 = (total/2 -1 + total/ 2) / 2
    // n1 = total /2 -1
    // n2 - total /2
    // mid = (n1 + n2 ) /2

    let midIndex1 = Math.floor(total / 2) - 1
    let midIndex2 = Math.floor(total / 2)

    let n1 = getKthElement(nums1, nums2, midIndex1 + 1)
    let n2 = getKthElement(nums1, nums2, midIndex2 + 1)

    return (n1 + n2) / 2
  }

}

/**
 * 找K值
 * @param {Array<number>} nums1
 * @param {Array<number>} nums2
 * @param {Number} k
 */
const getKthElement = (nums1, nums2, k) => {
  // 找到比 k小的 元素， 则从  nums[k/2 - 1], nums2[k/2 -1] 中找

  let len1 = nums1.length
  let len2 = nums2.length

  let index1 = 0
  let index2 = 0

  // let kIndex = 0

  while (true) {
    // 边界情况
    if (index1 === len1) {
      return nums2[index2 + k - 1]
    }

    if (index2 === len2) {
      return nums1[index1 + k - 1]
    }

    if (k === 1) {
      // 返回数组中较小的那个
      return Math.min(nums1[index1], nums2[index2])
    }


    // 正常情况
    // 对中间数组2分， 分别在 nums1 和 nums2中找到中间的值，进行比较
    let half = Math.ceil(k / 2)

    let newIndex1 = Math.min(index1 + half, len1) - 1
    let newIndex2 = Math.min(index2 + half, len2) - 1

    let p1 = nums1[newIndex1]
    let p2 = nums2[newIndex2]

    if (p1 <= p2) {
      k = k - (newIndex1 - index1 + 1)

      index1 = newIndex1 + 1
    } else {
      k = k - (newIndex2 - index2 + 1)

      index2 = newIndex2 + 1
    }
  }

}

/**
 * 归并排序
 */
/**
 *
 * @param {Array<number>} nums1
 * @param {Array<number>} nums2
 * @return {Number} n
 */
const findMedianSortedArrays = (nums1, nums2) => {

  // 归并排序

  let i = 0;
  let j = 0;
  let len1 = nums1.length
  let len2 = nums2.length

  let list = []

  // 这一步，是谁小，就添加谁到数组中， 双指针
  while (i < len1 && j < len2) {
    if (nums1[i] < nums2[j]) {
      list.push(nums1[i])

      i++
    } else {
      list.push(nums2[j])

      j++
    }
  }

  // 当上面进行完了以后，可能存在  nums1 的长度比nums2 大，或者相反， 则还有元素没有添加到 list中

  while (i < len1) {
    // 这种情况说明   nums1 的长度大于 nums2
    list.push(nums1[i])
    i++
  }

  while (j < len2) {
    list.push(nums2[j])
    j++
  }

  if (list.length % 2 === 0) {
    let mid = list.length / 2
    // 偶数
    return (list[mid - 1] + list[mid]) / 2
  } else {
    // 奇数
    let mid = Math.floor(list.length / 2)
    return list[mid]
  }
}

let a1 = [1, 2]
let a2 = [3, 4]

console.log(findMedianSortedArrays(a1, a2));
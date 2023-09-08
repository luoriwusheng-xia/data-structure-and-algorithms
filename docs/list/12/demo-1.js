var findMedianSortedArrays = function (nums1, nums2) {
  let arr = []

  let len = nums1.length + nums2.length
  if (nums1.length === 0 && nums2.length === 0) return 0

  if (len < 2) {
    return
  }

  // 慢指针
  let i = 0
  let j = 0

  for (let k = 0; k < len; k++) {
    if (i >= nums1.length - 1) {
      console.log('进来');
      arr = arr.concat(nums2)
      break
    }

    if (j >= nums2.length -1 ) {
      arr = arr.concat(nums1)
      break;
    }

    if (nums1[i] < nums2[j]) {

      arr.push(nums1[i])
      i++
    } else {
      arr.push(nums2[j])
      j++

    }
  }
  console.log('合并后的数组', arr);

  let mid = arr.length / 2

  return (arr[mid] + arr[mid + 1]) / 2
};

let nums1 = [1, 3]
let nums2 = [2]

console.log('结果：', findMedianSortedArrays(nums1, nums2));
/**
 * n1 + n2 + n3 .... = LeftSum
 *
 * n + [n-1] + [n-2] + ... = RightSum
 *
 * LeftSum + RightSum + 中间元素 = 数组Total总和
 */

function middelIndex(nums) {
  if (nums.length === 0) return -1

  // 拿到总和
  let sum = nums.reduce((prev, current) => {
    let total = prev + current

    return total
  }, 0)

  let total = 0
  for (let i=0; i<nums.length; i++) {
    total += nums[i]

    // 如果相等， 则找到了对应的索引位置
    if (total === sum) {
      return i
    } else {
      // 不等， 则将总数减去左侧的元素值
      sum -= nums[i]
    }
  }

  return -1
}

let i = middelIndex([1,3,4,7,3, 5])

console.log('中心点下标', i);  // 3
/**
 * 暴力求解
 * @param {Array<number>} num1
 * @param {Array<number>} num2
 */
const fn = (num1, num2) => {
  let arr = num1.concat(num2)

  // 做排序
  let len = arr.length
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - 1; j++) {
      let temp = null

      if (arr[j] > arr[j + 1]) {
        temp = arr[j]
        arr[j] = arr[j + 1]

        arr[j + 1] = temp
      }
    }
  }

  let mid = Math.ceil(arr.length / 2)
  // 索引从0开始计数的

  // 偶数
  if (arr.length % 2 === 0) {

    return (arr[mid-1] + arr[mid]) / 2
  }

  return arr[mid-1]
}

let num1 = [3]
let num2 = [-2,-1]

console.log(fn(num1, num2));
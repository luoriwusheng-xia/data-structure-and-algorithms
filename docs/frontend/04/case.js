let nums = [1,3,2,1,3]

/**
 * 方式1
 */
function findNum(arr) {
  let result = 0

  for (let i=0; i< arr.length; i++) {
    result = result ^ arr[i]
  }

  return result
}

/**
 * 方式2
 */
function findOnly(arr) {
  return arr.reduce((prev, current) => prev ^ current)
}

console.log(findNum(nums)); // 2
console.log(findOnly(nums)); // 2
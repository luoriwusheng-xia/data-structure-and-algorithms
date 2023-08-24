/**
 * 二分法查找
 */
function binarySearch(x) {
	// index不能从0开始， 因为0也是一个真实的索引位置
	let index = -1

	// 二分法左右2侧初始化值
	let left = 0
	let right = x

	/**
	 * 二分法， 左侧始终要小于或者等于右侧， 如果左侧大于右侧， 说明没有找到，没有意义了
	 */
	while (left <= right) {
		// 先拿到中间的值
		let mid = left + (right - left) / 2

		// 变成整数
		mid = parseInt(mid)

    // mid的平方比x还小，说明值落在右边
		if (mid * mid <= x) {
			// 值落在 在右侧区间， 则需要将left进行右移
			left = mid + 1

			index = mid
		} else {
			// 值落在 左区间 ， left左移
			right = mid - 1
		}
	}

	return index
}

let c1 = binarySearch(25)
let c2 = binarySearch(24)

console.log('入参： 25  结果： ', c1)
console.log('入参： 24  结果： ', c2, 'Math.sqrt(24) 计算结果=', Math.sqrt(24))

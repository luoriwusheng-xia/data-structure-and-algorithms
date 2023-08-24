function fn(nums) {
	if (nums.length === 0) return 0

	// 慢指针
	let i = 0

	for (let j = 1; j < nums.length; j++) {
		if (nums[i] !== nums[j]) {
			// 不相等，则i 和 j 需要一起往后移动
			i++

			// 场景1： 相邻2个元素不相等， 上面i++ 以后，其实就是等于j, 所以j=1 的时候， 下面是 nums[1] = nums[1] 无任何影响
			// 场景2： 当快指针j 和慢指针不相等，是将快指针的值赋值给慢指针对应索引
			nums[i] = nums[j]
		}
	}

	// 原始数组是被破坏掉的- 不过题目要求返回的是个数，而非原始数组
	console.log(nums) // [0, 1, 2, 3, 4, 3, 4]

	// 数组索引位置从0开始。 题目要求返回的是个数，这里 +1
	return i + 1
}

const t1 = [0, 1, 2, 2, 3, 3, 4] // length长度： 7

let c1 = fn(t1)

console.log('结果：', c1)

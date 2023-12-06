function eratosthenes(n) {
	// 1、创建一个长度位N的空数组， 假设arr 中默认都是 素数， undefined 会在后续判断为false
	let arr = new Array(n)

	// 2、依旧是一个计数器
	let count = 0

	for (let i = 2; i < n; i++) {
		if (!arr[i]) {
			count++

			/**
			 * 下面要做的就是 2 x 2 = 4 = 标记为合数  arr[4] = true  则上面的 if(!arr[4]) 就会跳过，不会进来
			 * 2 x 2 = 4
			 * 2 x 4 = 8
			 * 2 x 5 = 10
			 * ....
       *
       * 2 x 3 = 6
       * 2 x 5 = 10
       *
       * ---
       * 2 x 4 = 8
			 *
			 * 在内层循环中，怎么让i 递增，不可以直接去改变外层的i, 则只能j递增 j += i
			 * for循环是将 2 ~ n-1 之间， i的倍数，都找出来了，都标记为 合数（非素数）
			 */
			for (let j = 2 * i; j < n; j += i) {
				// j是合数的标记位
				arr[j] = true
			}
		}
	}

	return count
}

let c1 = eratosthenes(10)

let c2 = eratosthenes(100)

console.log(c1)

console.log(c2)

function eratosthenes(n) {
	// 1、创建一个长度位N的空数组， 假设arr 中默认都是 素数， undefined 会在后续判断为false
	let arr = new Array(n)

	// 2、依旧是一个计数器
	let count = 0

	for (let i = 2; i < n; i++) {
		if (!arr[i]) {
			count++

			for (let j = i * i; j < n; j += i) {
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

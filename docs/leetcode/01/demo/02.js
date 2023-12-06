/**
 * 1-2-3-4-5
 *
 * 变成
 * 5-4-3-2-1
 */

function Node(value, next = null) {
	return {
		value: value,
		next: next,
	}
}

/**
 * 翻转链表
 * @param {*} listNode
 */
function revertListNode(listNode) {
	// 上一个节点
	let prev = null
	// 下一个节点
	let next = null
	// 当前节点
	let current = listNode

	while (current !== null) {
		// 1、先存储下一个节点的引用。 一定是要先拿到下一个节点的引用，因为链表的特性是通过next找到下一个节点的。
		next = current.next
		// 2、翻转next指向， 第一次prev=null  实现1.next = null这个步骤
		current.next = prev

		// 3、更新prev节点
		prev = current

		// console.log('next还有吗 ', next);
		// 4、移动指针到下个节点， 等遍历到最后一个节点，即Node5, next=null, 触发while的终止条件，退出循环
		current = next
	}

	console.log(prev)

	return prev
}

/**
 * 初始化所需要的数据
 */
function main() {
	/**
	 * 链表初始化，应该从最后一个节点往前初始化， 需要维护好next指针指向
	 */
	let node5 = Node(5, null)
	let node4 = Node(4, node5)
	let node3 = Node(3, node4)
	let node2 = Node(2, node3)
	let node1 = Node(1, node2)

	// revertListNode(node1)

	let current = node1

	// 链表长度不确定，所以使用 while遍历，而不是用for循环
	while (current) {
		console.log('当前节点', current)
		// 移动指针-只能打印1-4 的Node, 第5个节点，next=null, 就无法打印
		current = current.next
	}
}

main()

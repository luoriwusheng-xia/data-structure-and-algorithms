// 节点
function Node(value, next = null) {
	return {
		value: value,
		next: next,
	}
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

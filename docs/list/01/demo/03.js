function ListNode (val, next) {
  this.val = val === undefined ? 0 : val

  this.next = next === undefined ? null : next
}

const revertListNode = (head) => {
  if (head === null || head.next === null) {
    /**
     * 当前节点没有下一个节点，就返回当前节点
     * 例如： 5没有 next, 则此处返回的就是5
     */
    return head
  }

  let newNode = revertListNode(head.next)

  console.log('newNode--->',newNode);
}

let node5 = new ListNode(5, null)
let node4 = new ListNode(4, node5)
let node3 = new ListNode(3, node4)
let node2 = new ListNode(2, node3)
let node1 = new ListNode(1, node2)

revertListNode(node1)
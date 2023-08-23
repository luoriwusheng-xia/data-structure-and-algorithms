function ListNode (val, next) {
  this.val = val === undefined ? 0 : val

  this.next = next === undefined ? null : next
}

const revertListNode = (head) => {
  // head = null 说明传入进来的链表本身就是空，无需翻转
  // head.next === null  表示递归到最后一个元素
  if (head === null || head.next === null) {
    /**
     * 当前节点没有下一个节点，就返回当前节点
     * 例如： 5没有 next, 则此处返回的就是5
     */
    return head
  }

  // 需要从最后一个元素进行两两节点 进行翻转

  let newNode = revertListNode(head.next)

  /**
   * 分析
   * 递归到5， newNode = 5
   * 原本 4.next = 5 ,原本 head(4).next.next 是null， 现在改为 head(4).next.next = head(4); 其实已经将 n.next 改为了 head(4)
   * 现在需要将 head(4).next = null 就可以了
   *
   */

  head.next.next = head
  head.next = null

  return newNode
}

let node5 = new ListNode(5, null)
let node4 = new ListNode(4, node5)
let node3 = new ListNode(3, node4)
let node2 = new ListNode(2, node3)
let node1 = new ListNode(1, node2)

let result = revertListNode(node1)

console.log(result);
# HTMLCollection与NodeList区别

示例代码

<script setup>
  import demo1 from './demo-01.vue'

  import demo2 from './demo-02.vue'
</script>

<demo1/>

## HTMLCollection

[HTMLCollection-MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCollection)

* document.getElementsByClassName('li')
* document.forms
* document.getElementsByTagName('li')

以上都是返回 `HTMLCollection` 类型

<<<./demo-01.vue

### 特点

*  实时性，页面上DOM的增加，减少，或者改变，会影响 HTMLCollection 的值， 我们在 1s钟前拿到DOM的集合， 然后赋值给变量a, 然后删除DOM里面的个数，a变量无需重新获取，a就是最新的DOM的集合
* HTMLCollection里面 元素的顺序即 文档流中的顺序

* 这种实时性，有一个缺点，会导致我们本身以为在操作js变量的时候，无意当中竟然操作了页面的DOM

## NodeList

[NodeList-MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/NodeList)

- document.querySelectorAll
- node.childNodes

<demo2/>

<<<./demo-02.vue


### 特点

- 类数组，可以用 forEach 对节点进行迭代， 也可以使用Array.from转成真正的数组
- 静态的， 获取后与页面UI没有关联，非实时性

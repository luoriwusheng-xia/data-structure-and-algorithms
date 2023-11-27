




## [\#](#_34-手写常见排序){.header-anchor} 34 手写常见排序 {#_34-手写常见排序}

### [\#](#_1-冒泡排序){.header-anchor} 1 冒泡排序 {#_1-冒泡排序}

> 冒泡排序的原理如下，从第一个元素开始，把当前元素和下一个索引元素进行比较。如果当前元素大，那么就交换位置，重复操作直到比较到最后一个元素，那么此时最后一个元素就是该数组中最大的数。下一轮重复以上操作，但是此时最后一个元素已经是最大数了，所以不需要再比较最后一个元素，只需要比较到
> `length - 1` 的位置。

::: {.language-js .extra-class}
``` language-js

                                        function
                                        bubbleSort
                                        (
                                        list
                                        )
                                        {
                                        var
                                        n =
                                        list.
                                        length;
                                        if
                                        (
                                        !
                                        n)
                                        return
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        var
                                        i =
                                        0
                                        ;
                                        i <
                                        n;
                                        i++
                                        )
                                        {
                                        // 注意这里需要 n - i - 1
                                        for
                                        (
                                        var
                                        j =
                                        0
                                        ;
                                        j <
                                        n -
                                        i -
                                        1
                                        ;
                                        j++
                                        )
                                        {
                                        if
                                        (
                                        list[
                                        j]
                                        >
                                        list[
                                        j +
                                        1
                                        ]
                                        )
                                        {
                                        var
                                        temp =
                                        list[
                                        j +
                                        1
                                        ]
                                        ;
                                        list[
                                        j +
                                        1
                                        ]
                                        =
                                        list[
                                        j]
                                        ;
                                        list[
                                        j]
                                        =
                                        temp;
                                        }
                                        }
                                        }
                                        return
                                        list;
                                        }


```
:::

### [\#](#_2-快速排序){.header-anchor} 2 快速排序 {#_2-快速排序}

**思路分析**

-   找到中间位置`midValue`
-   遍历数组，小于`midValue` 放在`left` ，否则放在`right`
-   继续递归，最后`concat` 拼接返回
-   使用`splice` 会修改原数组，使用`slice` 不会修改原数组（推荐）
-   一层遍历+二分的时间复杂度是`O(nlogn)`

**快速排序（使用 splice）**

::: {.language-js .extra-class}
``` language-js

                                        /**
 * 快速排序（使用 splice）
 * @param arr:number[] number arr
 */
                                        function
                                        quickSort1
                                        (
                                        arr
                                        )
                                        {
                                        const
                                        length =
                                        arr.
                                        length
  if
                                        (
                                        length ===
                                        0
                                        )
                                        return
                                        arr

  // 获取中间的数
                                        const
                                        midIndex =
                                        Math.
                                        floor
                                        (
                                        length /
                                        2
                                        )
                                        const
                                        midValue =
                                        arr.
                                        splice
                                        (
                                        midIndex,
                                        1
                                        )
                                        [
                                        0
                                        ]
                                        // splice会修改原数组，传入开始位置和长度是1
                                        const
                                        left =
                                        [
                                        ]
                                        const
                                        right =
                                        [
                                        ]
                                        // 注意：这里不用直接用 length ，而是用 arr.length 。因为 arr 已经被 splice 给修改了
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        arr.
                                        length;
                                        i++
                                        )
                                        {
                                        const
                                        n =
                                        arr[
                                        i]
                                        if
                                        (
                                        n <
                                        midValue)
                                        {
                                        // 小于 midValue ，则放在 left
                                        left.
                                        push
                                        (
                                        n)
                                        }
                                        else
                                        {
                                        // 大于 midValue ，则放在 right
                                        right.
                                        push
                                        (
                                        n)
                                        }
                                        }
                                        return
                                        quickSort1
                                        (
                                        left)
                                        .
                                        concat
                                        (
                                        [
                                        midValue]
                                        ,
                                        quickSort1
                                        (
                                        right)
                                        )
                                        }


```
:::

**快速排序（使用 slice）**

::: {.language-js .extra-class}
``` language-js

                                        /**
 * 快速排序（使用 slice）
 * @param arr number arr
 */
                                        function
                                        quickSort2
                                        (
                                        arr
                                        )
                                        {
                                        const
                                        length =
                                        arr.
                                        length
  if
                                        (
                                        length ===
                                        0
                                        )
                                        return
                                        arr

  // 获取中间的数
                                        const
                                        midIndex =
                                        Math.
                                        floor
                                        (
                                        length /
                                        2
                                        )
                                        const
                                        midValue =
                                        arr.
                                        slice
                                        (
                                        midIndex,
                                        midIndex +
                                        1
                                        )
                                        [
                                        0
                                        ]
                                        // 使用slice不会修改原数组，传入开始位置和结束位置
                                        const
                                        left =
                                        [
                                        ]
                                        const
                                        right =
                                        [
                                        ]
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        length;
                                        i++
                                        )
                                        {
                                        if
                                        (
                                        i !==
                                        midIndex)
                                        {
                                        // 这里要忽略掉midValue
                                        const
                                        n =
                                        arr[
                                        i]
                                        if
                                        (
                                        n <
                                        midValue)
                                        {
                                        // 小于 midValue ，则放在 left
                                        left.
                                        push
                                        (
                                        n)
                                        }
                                        else
                                        {
                                        // 大于 midValue ，则放在 right
                                        right.
                                        push
                                        (
                                        n)
                                        }
                                        }
                                        }
                                        return
                                        quickSort2
                                        (
                                        left)
                                        .
                                        concat
                                        (
                                        [
                                        midValue]
                                        ,
                                        quickSort2
                                        (
                                        right)
                                        )
                                        }


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 功能测试
                                        const
                                        arr1 =
                                        [
                                        1
                                        ,
                                        6
                                        ,
                                        2
                                        ,
                                        7
                                        ,
                                        3
                                        ,
                                        8
                                        ,
                                        4
                                        ,
                                        9
                                        ,
                                        5
                                        ]
                                        console.
                                        info
                                        (
                                        quickSort2
                                        (
                                        arr1)
                                        )


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 性能测试
                                        // 快速排序（使用 splice）
                                        const
                                        arr1 =
                                        [
                                        ]
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        10
                                        *
                                        10000
                                        ;
                                        i++
                                        )
                                        {
                                        arr1.
                                        push
                                        (
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        1000
                                        )
                                        )
                                        }
                                        console.
                                        time
                                        (
                                        'quickSort1'
                                        )
                                        quickSort1
                                        (
                                        arr1)
                                        console.
                                        timeEnd
                                        (
                                        'quickSort1'
                                        )
                                        // 74ms
                                        // 快速排序（使用 slice）
                                        const
                                        arr2 =
                                        [
                                        ]
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        10
                                        *
                                        10000
                                        ;
                                        i++
                                        )
                                        {
                                        arr2.
                                        push
                                        (
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        1000
                                        )
                                        )
                                        }
                                        console.
                                        time
                                        (
                                        'quickSort2'
                                        )
                                        quickSort2
                                        (
                                        arr2)
                                        console.
                                        timeEnd
                                        (
                                        'quickSort2'
                                        )
                                        // 82ms


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 单独比较 splice 和 slice
                                        const
                                        arr1 =
                                        [
                                        ]
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        10
                                        *
                                        10000
                                        ;
                                        i++
                                        )
                                        {
                                        arr1.
                                        push
                                        (
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        1000
                                        )
                                        )
                                        }
                                        console.
                                        time
                                        (
                                        'splice'
                                        )
                                        arr1.
                                        splice
                                        (
                                        5
                                        *
                                        10000
                                        ,
                                        1
                                        )
                                        console.
                                        timeEnd
                                        (
                                        'splice'
                                        )
                                        // 0.08ms
                                        const
                                        arr2 =
                                        [
                                        ]
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        10
                                        *
                                        10000
                                        ;
                                        i++
                                        )
                                        {
                                        arr2.
                                        push
                                        (
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        1000
                                        )
                                        )
                                        }
                                        console.
                                        time
                                        (
                                        'slice'
                                        )
                                        arr2.
                                        slice
                                        (
                                        5
                                        *
                                        10000
                                        ,
                                        5
                                        *
                                        10000
                                        +
                                        1
                                        )
                                        console.
                                        timeEnd
                                        (
                                        'slice'
                                        )
                                        // 0.008ms


```
:::

### [\#](#_3-选择排序){.header-anchor} 3 选择排序 {#_3-选择排序}

::: {.language-js .extra-class}
``` language-js

                                        function
                                        selectSort
                                        (
                                        arr
                                        )
                                        {
                                        // 缓存数组长度
                                        const
                                        len =
                                        arr.
                                        length;
                                        // 定义 minIndex，缓存当前区间最小值的索引，注意是索引
                                        let
                                        minIndex;
                                        // i 是当前排序区间的起点
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        len -
                                        1
                                        ;
                                        i++
                                        )
                                        {
                                        // 初始化 minIndex 为当前区间第一个元素
                                        minIndex =
                                        i;
                                        // i、j分别定义当前区间的上下界，i是左边界，j是右边界
                                        for
                                        (
                                        let
                                        j =
                                        i;
                                        j <
                                        len;
                                        j++
                                        )
                                        {
                                        // 若 j 处的数据项比当前最小值还要小，则更新最小值索引为 j
                                        if
                                        (
                                        arr[
                                        j]
                                        <
                                        arr[
                                        minIndex]
                                        )
                                        {
                                        minIndex =
                                        j;
                                        }
                                        }
                                        // 如果 minIndex 对应元素不是目前的头部元素，则交换两者
                                        if
                                        (
                                        minIndex !==
                                        i)
                                        {
                                        [
                                        arr[
                                        i]
                                        ,
                                        arr[
                                        minIndex]
                                        ]
                                        =
                                        [
                                        arr[
                                        minIndex]
                                        ,
                                        arr[
                                        i]
                                        ]
                                        ;
                                        }
                                        }
                                        return
                                        arr;
                                        }
                                        // console.log(selectSort([3, 6, 2, 4, 1]));


```
:::

### [\#](#_4-插入排序){.header-anchor} 4 插入排序 {#_4-插入排序}

::: {.language-js .extra-class}
``` language-js

                                        function
                                        insertSort
                                        (
                                        arr
                                        )
                                        {
                                        for
                                        (
                                        let
                                        i =
                                        1
                                        ;
                                        i <
                                        arr.
                                        length;
                                        i++
                                        )
                                        {
                                        let
                                        j =
                                        i;
                                        let
                                        target =
                                        arr[
                                        j]
                                        ;
                                        while
                                        (
                                        j >
                                        0
                                        &&
                                        arr[
                                        j -
                                        1
                                        ]
                                        >
                                        target)
                                        {
                                        arr[
                                        j]
                                        =
                                        arr[
                                        j -
                                        1
                                        ]
                                        ;
                                        j--
                                        ;
                                        }
                                        arr[
                                        j]
                                        =
                                        target;
                                        }
                                        return
                                        arr;
                                        }
                                        // console.log(insertSort([3, 6, 2, 4, 1]));


```
:::

### [\#](#_5-二分查找){.header-anchor} 5 二分查找 {#_5-二分查找}

::: {.language-js .extra-class}
``` language-js

                                        function
                                        search
                                        (

                                            arr,
                                            target,
                                            start,
                                            end

                                        )
                                        {
                                        let
                                        targetIndex =
                                        -
                                        1
                                        ;
                                        let
                                        mid =
                                        Math.
                                        floor
                                        (
                                        (
                                        start +
                                        end)
                                        /
                                        2
                                        )
                                        ;
                                        if
                                        (
                                        arr[
                                        mid]
                                        ===
                                        target)
                                        {
                                        targetIndex =
                                        mid;
                                        return
                                        targetIndex;
                                        }
                                        if
                                        (
                                        start >=
                                        end)
                                        {
                                        return
                                        targetIndex;
                                        }
                                        if
                                        (
                                        arr[
                                        mid]
                                        <
                                        target)
                                        {
                                        return
                                        search
                                        (
                                        arr,
                                        target,
                                        mid +
                                        1
                                        ,
                                        end)
                                        ;
                                        }
                                        else
                                        {
                                        return
                                        search
                                        (
                                        arr,
                                        target,
                                        start,
                                        mid -
                                        1
                                        )
                                        ;
                                        }
                                        }
                                        // const dataArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                                        // const position = search(dataArr, 6, 0, dataArr.length - 1);
                                        // if (position !== -1) {
                                        //   console.log(`目标元素在数组中的位置:${position}`);
                                        // } else {
                                        //   console.log("目标元素不在数组中 ");
                                        // }


```
:::

## [\#](#_35-算法数据结构){.header-anchor} 35 算法数据结构 {#_35-算法数据结构}

### [\#](#_1-实现一个链表结构){.header-anchor} 1 实现一个链表结构 {#_1-实现一个链表结构}

链表结构

看图理解next层级

::: {.language-js .extra-class}
``` language-js

                                        // 链表 从头尾删除、增加 性能比较好
                                        // 分为很多类 常用单向链表、双向链表
                                        // js模拟链表结构：增删改查
                                        // node节点
                                        class
                                        Node
                                        {
                                        constructor
                                        (

                                            element,
                                            next

                                        )
                                        {
                                        this
                                        .
                                        element =
                                        element
    this
                                        .
                                        next =
                                        next
  }
                                        }
                                        class
                                        LinkedList
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        head =
                                        null
                                        // 默认应该指向第一个节点
                                        this
                                        .
                                        size =
                                        0
                                        // 通过这个长度可以遍历这个链表
                                        }
                                        // 增加O(n)
                                        add
                                        (

                                            index,
                                            element

                                        )
                                        {
                                        if
                                        (
                                        arguments.
                                        length ===
                                        1
                                        )
                                        {
                                        // 向末尾添加
                                        element =
                                        index // 当前元素等于传递的第一项
                                        index =
                                        this
                                        .
                                        size // 索引指向最后一个元素
                                        }
                                        if
                                        (
                                        index <
                                        0
                                        ||
                                        index >
                                        this
                                        .
                                        size)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '添加的索引不正常'
                                        )
                                        }
                                        if
                                        (
                                        index ===
                                        0
                                        )
                                        {
                                        // 直接找到头部 把头部改掉 性能更好
                                        let
                                        head =
                                        this
                                        .
                                        head
    this
                                        .
                                        head =
                                        new
                                        Node
                                        (
                                        element,
                                        head)
                                        }
                                        else
                                        {
                                        // 获取当前头指针
                                        let
                                        current =
                                        this
                                        .
                                        head
    // 不停遍历 直到找到最后一项 添加的索引是1就找到第0个的next赋值
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        index-
                                        1
                                        ;
                                        i++
                                        )
                                        {
                                        // 找到它的前一个
                                        current =
                                        current.
                                        next
    }
                                        // 让创建的元素指向上一个元素的下一个
                                        // 看图理解next层级
                                        current.
                                        next =
                                        new
                                        Node
                                        (
                                        element,
                                        current.
                                        next)
                                        // 让当前元素指向下一个元素的next
                                        }
                                        this
                                        .
                                        size++
                                        ;
                                        }
                                        // 删除O(n)
                                        remove
                                        (
                                        index
                                        )
                                        {
                                        if
                                        (
                                        index <
                                        0
                                        ||
                                        index >=
                                        this
                                        .
                                        size)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '删除的索引不正常'
                                        )
                                        }
                                        this
                                        .
                                        size--
                                        if
                                        (
                                        index ===
                                        0
                                        )
                                        {
                                        let
                                        head =
                                        this
                                        .
                                        head
    this
                                        .
                                        head =
                                        this
                                        .
                                        head.
                                        next // 移动指针位置
                                        return
                                        head // 返回删除的元素
                                        }
                                        else
                                        {
                                        let
                                        current =
                                        this
                                        .
                                        head
    for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        index-
                                        1
                                        ;
                                        i++
                                        )
                                        {
                                        // index-1找到它的前一个
                                        current =
                                        current.
                                        next
    }
                                        let
                                        returnVal =
                                        current.
                                        next // 返回删除的元素
                                        // 找到待删除的指针的上一个 current.next.next
                                        // 如删除200， 100=>200=>300 找到200的上一个100的next的next为300，把300赋值给100的next即可
                                        current.
                                        next =
                                        current.
                                        next.
                                        next

    return
                                        returnVal
  }
                                        }
                                        // 查找O(n)
                                        get
                                        (
                                        index)
                                        {
                                        if
                                        (
                                        index <
                                        0
                                        ||
                                        index >=
                                        this
                                        .
                                        size)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '查找的索引不正常'
                                        )
                                        }
                                        let
                                        current =
                                        this
                                        .
                                        head
  for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        index;
                                        i++
                                        )
                                        {
                                        current =
                                        current.
                                        next
  }
                                        return
                                        current
 }
                                        }
                                        var
                                        ll =
                                        new
                                        LinkedList
                                        (
                                        )
                                        ll.
                                        add
                                        (
                                        0
                                        ,
                                        100
                                        )
                                        // Node { ellement: 100, next: null }
                                        ll.
                                        add
                                        (
                                        0
                                        ,
                                        200
                                        )
                                        // Node { element: 200, next: Node { element: 100, next: null } }
                                        ll.
                                        add
                                        (
                                        1
                                        ,
                                        500
                                        )
                                        // Node {element: 200,next: Node { element: 100, next: Node { element: 500, next: null } } }
                                        ll.
                                        add
                                        (
                                        300
                                        )
                                        ll.
                                        remove
                                        (
                                        0
                                        )
                                        console.
                                        log
                                        (
                                        ll.
                                        get
                                        (
                                        2
                                        )
                                        ,
                                        'get'
                                        )
                                        console.
                                        log
                                        (
                                        ll.
                                        head)
                                        module.
                                        exports =
                                        LinkedList



```
:::

### [\#](#_2-实现一个队列){.header-anchor} 2 实现一个队列 {#_2-实现一个队列}

> 基于链表结构实现队列

::: {.language-js .extra-class}
``` language-js

                                        const
                                        LinkedList =
                                        require
                                        (
                                        './实现一个链表结构'
                                        )
                                        // 用链表默认使用数组来模拟队列，性能更佳
                                        class
                                        Queue
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        ll =
                                        new
                                        LinkedList
                                        (
                                        )
                                        }
                                        // 向队列中添加
                                        offer
                                        (
                                        elem
                                        )
                                        {
                                        this
                                        .
                                        ll.
                                        add
                                        (
                                        elem)
                                        }
                                        // 查看第一个
                                        peek
                                        (
                                        )
                                        {
                                        return
                                        this
                                        .
                                        ll.
                                        get
                                        (
                                        0
                                        )
                                        }
                                        // 队列只能从头部删除
                                        remove
                                        (
                                        )
                                        {
                                        return
                                        this
                                        .
                                        ll.
                                        remove
                                        (
                                        0
                                        )
                                        }
                                        }
                                        var
                                        queue =
                                        new
                                        Queue
                                        (
                                        )
                                        queue.
                                        offer
                                        (
                                        1
                                        )
                                        queue.
                                        offer
                                        (
                                        2
                                        )
                                        queue.
                                        offer
                                        (
                                        3
                                        )
                                        var
                                        removeVal =
                                        queue.
                                        remove
                                        (
                                        3
                                        )
                                        console.
                                        log
                                        (
                                        queue.
                                        ll,
                                        'queue.ll'
                                        )
                                        console.
                                        log
                                        (
                                        removeVal,
                                        'queue.remove'
                                        )
                                        console.
                                        log
                                        (
                                        queue.
                                        peek
                                        (
                                        )
                                        ,
                                        'queue.peek'
                                        )


```
:::

### [\#](#_3-递归反转链表){.header-anchor} 3 递归反转链表 {#_3-递归反转链表}

::: {.language-js .extra-class}
``` language-js

                                        // node节点
                                        class
                                        Node
                                        {
                                        constructor
                                        (

                                            element,
                                            next

                                        )
                                        {
                                        this
                                        .
                                        element =
                                        element
    this
                                        .
                                        next =
                                        next
  }
                                        }
                                        class
                                        LinkedList
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        head =
                                        null
                                        // 默认应该指向第一个节点
                                        this
                                        .
                                        size =
                                        0
                                        // 通过这个长度可以遍历这个链表
                                        }
                                        // 增加O(n)
                                        add
                                        (

                                            index,
                                            element

                                        )
                                        {
                                        if
                                        (
                                        arguments.
                                        length ===
                                        1
                                        )
                                        {
                                        // 向末尾添加
                                        element =
                                        index // 当前元素等于传递的第一项
                                        index =
                                        this
                                        .
                                        size // 索引指向最后一个元素
                                        }
                                        if
                                        (
                                        index <
                                        0
                                        ||
                                        index >
                                        this
                                        .
                                        size)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '添加的索引不正常'
                                        )
                                        }
                                        if
                                        (
                                        index ===
                                        0
                                        )
                                        {
                                        // 直接找到头部 把头部改掉 性能更好
                                        let
                                        head =
                                        this
                                        .
                                        head
    this
                                        .
                                        head =
                                        new
                                        Node
                                        (
                                        element,
                                        head)
                                        }
                                        else
                                        {
                                        // 获取当前头指针
                                        let
                                        current =
                                        this
                                        .
                                        head
    // 不停遍历 直到找到最后一项 添加的索引是1就找到第0个的next赋值
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        index-
                                        1
                                        ;
                                        i++
                                        )
                                        {
                                        // 找到它的前一个
                                        current =
                                        current.
                                        next
    }
                                        // 让创建的元素指向上一个元素的下一个
                                        // 看图理解next层级 ![](https://s.poetries.work/images/20210522115056.png)
                                        current.
                                        next =
                                        new
                                        Node
                                        (
                                        element,
                                        current.
                                        next)
                                        // 让当前元素指向下一个元素的next
                                        }
                                        this
                                        .
                                        size++
                                        ;
                                        }
                                        // 删除O(n)
                                        remove
                                        (
                                        index
                                        )
                                        {
                                        if
                                        (
                                        index <
                                        0
                                        ||
                                        index >=
                                        this
                                        .
                                        size)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '删除的索引不正常'
                                        )
                                        }
                                        this
                                        .
                                        size--
                                        if
                                        (
                                        index ===
                                        0
                                        )
                                        {
                                        let
                                        head =
                                        this
                                        .
                                        head
    this
                                        .
                                        head =
                                        this
                                        .
                                        head.
                                        next // 移动指针位置
                                        return
                                        head // 返回删除的元素
                                        }
                                        else
                                        {
                                        let
                                        current =
                                        this
                                        .
                                        head
    for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        index-
                                        1
                                        ;
                                        i++
                                        )
                                        {
                                        // index-1找到它的前一个
                                        current =
                                        current.
                                        next
    }
                                        let
                                        returnVal =
                                        current.
                                        next // 返回删除的元素
                                        // 找到待删除的指针的上一个 current.next.next
                                        // 如删除200， 100=>200=>300 找到200的上一个100的next的next为300，把300赋值给100的next即可
                                        current.
                                        next =
                                        current.
                                        next.
                                        next

    return
                                        returnVal
  }
                                        }
                                        // 查找O(n)
                                        get
                                        (
                                        index)
                                        {
                                        if
                                        (
                                        index <
                                        0
                                        ||
                                        index >=
                                        this
                                        .
                                        size)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '查找的索引不正常'
                                        )
                                        }
                                        let
                                        current =
                                        this
                                        .
                                        head
  for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        index;
                                        i++
                                        )
                                        {
                                        current =
                                        current.
                                        next
  }
                                        return
                                        current
 }
                                        reverse
                                        (
                                        )
                                        {
                                        const
                                        reverse
                                        =
                                        head
                                        =>
                                        {
                                        if
                                        (
                                        head ==
                                        null
                                        ||
                                        head.
                                        next ==
                                        null
                                        )
                                        {
                                        return
                                        head
    }
                                        let
                                        newHead =
                                        reverse
                                        (
                                        head.
                                        next)
                                        // 从这个链表的最后一个开始反转，让当前下一个元素的next指向自己，自己指向null
                                        // ![](https://s.poetries.work/images/20210522161710.png)
                                        // 刚开始反转的是最后两个
                                        head.
                                        next.
                                        next =
                                        head
    head.
                                        next =
                                        null
                                        return
                                        newHead
  }
                                        return
                                        reverse
                                        (
                                        this
                                        .
                                        head)
                                        }
                                        }
                                        let
                                        ll =
                                        new
                                        LinkedList
                                        (
                                        )
                                        ll.
                                        add
                                        (
                                        1
                                        )
                                        ll.
                                        add
                                        (
                                        2
                                        )
                                        ll.
                                        add
                                        (
                                        3
                                        )
                                        ll.
                                        add
                                        (
                                        4
                                        )
                                        // console.dir(ll,{depth: 1000})
                                        console.
                                        log
                                        (
                                        ll.
                                        reverse
                                        (
                                        )
                                        )


```
:::

### [\#](#_4-二叉树搜索){.header-anchor} 4 二叉树搜索 {#_4-二叉树搜索}

::: {.language-js .extra-class}
``` language-js

                                        // 二叉搜索树
                                        class
                                        Node
                                        {
                                        constructor
                                        (

                                            element,
                                            parent

                                        )
                                        {
                                        this
                                        .
                                        parent =
                                        parent // 父节点
                                        this
                                        .
                                        element =
                                        element // 当前存储内容
                                        this
                                        .
                                        left =
                                        null
                                        // 左子树
                                        this
                                        .
                                        right =
                                        null
                                        // 右子树
                                        }
                                        }
                                        class
                                        BST
                                        {
                                        constructor
                                        (
                                        compare
                                        )
                                        {
                                        this
                                        .
                                        root =
                                        null
                                        // 树根
                                        this
                                        .
                                        size =
                                        0
                                        // 树中的节点个数
                                        this
                                        .
                                        compare =
                                        compare ||
                                        this
                                        .
                                        compare
  }
                                        compare
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        return
                                        a -
                                        b
  }
                                        add
                                        (
                                        element
                                        )
                                        {
                                        if
                                        (
                                        this
                                        .
                                        root ===
                                        null
                                        )
                                        {
                                        this
                                        .
                                        root =
                                        new
                                        Node
                                        (
                                        element,
                                        null
                                        )
                                        this
                                        .
                                        size++
                                        return
                                        }
                                        // 获取根节点 用当前添加的进行判断 放左边还是放右边
                                        let
                                        currentNode =
                                        this
                                        .
                                        root
    let
                                        compare
    let
                                        parent =
                                        null
                                        while
                                        (
                                        currentNode)
                                        {
                                        compare =
                                        this
                                        .
                                        compare
                                        (
                                        element,
                                        currentNode.
                                        element)
                                        parent =
                                        currentNode // 先将父亲保存起来
                                        // currentNode要不停的变化
                                        if
                                        (
                                        compare >
                                        0
                                        )
                                        {
                                        currentNode =
                                        currentNode.
                                        right
      }
                                        else
                                        if
                                        (
                                        compare <
                                        0
                                        )
                                        {
                                        currentNode =
                                        currentNode.
                                        left
      }
                                        else
                                        {
                                        currentNode.
                                        element =
                                        element // 相等时 先覆盖后续处理
                                        }
                                        }
                                        let
                                        newNode =
                                        new
                                        Node
                                        (
                                        element,
                                        parent)
                                        if
                                        (
                                        compare >
                                        0
                                        )
                                        {
                                        parent.
                                        right =
                                        newNode
    }
                                        else
                                        if
                                        (
                                        compare <
                                        0
                                        )
                                        {
                                        parent.
                                        left =
                                        newNode
    }
                                        this
                                        .
                                        size++
                                        }
                                        }


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 测试
                                        var
                                        bst =
                                        new
                                        BST
                                        (
                                        (

                                            a,
                                            b

                                        )
                                        =>
                                        b.
                                        age-
                                        a.
                                        age)
                                        // 模拟sort方法
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        10
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        8
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        19
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        20
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        5
                                        }
                                        )
                                        console.
                                        log
                                        (
                                        bst)


```
:::

### [\#](#_5-二叉树层次遍历){.header-anchor} 5 二叉树层次遍历 {#_5-二叉树层次遍历}

::: {.language-js .extra-class}
``` language-js

                                        // 二叉树层次遍历
                                        class
                                        Node
                                        {
                                        constructor
                                        (

                                            element,
                                            parent

                                        )
                                        {
                                        this
                                        .
                                        parent =
                                        parent // 父节点
                                        this
                                        .
                                        element =
                                        element // 当前存储内容
                                        this
                                        .
                                        left =
                                        null
                                        // 左子树
                                        this
                                        .
                                        right =
                                        null
                                        // 右子树
                                        }
                                        }
                                        class
                                        BST
                                        {
                                        constructor
                                        (
                                        compare
                                        )
                                        {
                                        this
                                        .
                                        root =
                                        null
                                        // 树根
                                        this
                                        .
                                        size =
                                        0
                                        // 树中的节点个数
                                        this
                                        .
                                        compare =
                                        compare ||
                                        this
                                        .
                                        compare
  }
                                        compare
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        return
                                        a -
                                        b
  }
                                        add
                                        (
                                        element
                                        )
                                        {
                                        if
                                        (
                                        this
                                        .
                                        root ===
                                        null
                                        )
                                        {
                                        this
                                        .
                                        root =
                                        new
                                        Node
                                        (
                                        element,
                                        null
                                        )
                                        this
                                        .
                                        size++
                                        return
                                        }
                                        // 获取根节点 用当前添加的进行判断 放左边还是放右边
                                        let
                                        currentNode =
                                        this
                                        .
                                        root
    let
                                        compare
    let
                                        parent =
                                        null
                                        while
                                        (
                                        currentNode)
                                        {
                                        compare =
                                        this
                                        .
                                        compare
                                        (
                                        element,
                                        currentNode.
                                        element)
                                        parent =
                                        currentNode // 先将父亲保存起来
                                        // currentNode要不停的变化
                                        if
                                        (
                                        compare >
                                        0
                                        )
                                        {
                                        currentNode =
                                        currentNode.
                                        right
      }
                                        else
                                        if
                                        (
                                        compare <
                                        0
                                        )
                                        {
                                        currentNode =
                                        currentNode.
                                        left
      }
                                        else
                                        {
                                        currentNode.
                                        element =
                                        element // 相等时 先覆盖后续处理
                                        }
                                        }
                                        let
                                        newNode =
                                        new
                                        Node
                                        (
                                        element,
                                        parent)
                                        if
                                        (
                                        compare >
                                        0
                                        )
                                        {
                                        parent.
                                        right =
                                        newNode
    }
                                        else
                                        if
                                        (
                                        compare <
                                        0
                                        )
                                        {
                                        parent.
                                        left =
                                        newNode
    }
                                        this
                                        .
                                        size++
                                        }
                                        // 层次遍历 队列
                                        levelOrderTraversal
                                        (
                                        visitor
                                        )
                                        {
                                        if
                                        (
                                        this
                                        .
                                        root ==
                                        null
                                        )
                                        {
                                        return
                                        }
                                        let
                                        stack =
                                        [
                                        this
                                        .
                                        root]
                                        let
                                        index =
                                        0
                                        // 指针 指向0
                                        let
                                        currentNode
    while
                                        (
                                        currentNode =
                                        stack[
                                        index++
                                        ]
                                        )
                                        {
                                        // 反转二叉树
                                        let
                                        tmp =
                                        currentNode.
                                        left
      currentNode.
                                        left =
                                        currentNode.
                                        right
      currentNode.
                                        right =
                                        tmp
      visitor.
                                        visit
                                        (
                                        currentNode.
                                        element)
                                        if
                                        (
                                        currentNode.
                                        left)
                                        {
                                        stack.
                                        push
                                        (
                                        currentNode.
                                        left)
                                        }
                                        if
                                        (
                                        currentNode.
                                        right)
                                        {
                                        stack.
                                        push
                                        (
                                        currentNode.
                                        right)
                                        }
                                        }
                                        }
                                        }


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 测试
                                        var
                                        bst =
                                        new
                                        BST
                                        (
                                        (

                                            a,
                                            b

                                        )
                                        =>
                                        a.
                                        age-
                                        b.
                                        age)
                                        // 模拟sort方法
                                        // ![](https://s.poetries.work/images/20210522203619.png)
                                        // ![](https://s.poetries.work/images/20210522211809.png)
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        10
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        8
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        19
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        6
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        15
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        22
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        20
                                        }
                                        )
                                        // 使用访问者模式
                                        class
                                        Visitor
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        visit
                                        =
                                        function
                                        (
                                        elem
                                        )
                                        {
                                        elem.
                                        age =
                                        elem.
                                        age*
                                        2
                                        }
                                        }
                                        }
                                        // ![](https://s.poetries.work/images/20210523095515.png)
                                        console.
                                        log
                                        (
                                        bst.
                                        levelOrderTraversal
                                        (
                                        new
                                        Visitor
                                        (
                                        )
                                        )
                                        )


```
:::

### [\#](#_6-二叉树深度遍历){.header-anchor} 6 二叉树深度遍历 {#_6-二叉树深度遍历}

::: {.language-js .extra-class}
``` language-js

                                        // 二叉树深度遍历
                                        class
                                        Node
                                        {
                                        constructor
                                        (

                                            element,
                                            parent

                                        )
                                        {
                                        this
                                        .
                                        parent =
                                        parent // 父节点
                                        this
                                        .
                                        element =
                                        element // 当前存储内容
                                        this
                                        .
                                        left =
                                        null
                                        // 左子树
                                        this
                                        .
                                        right =
                                        null
                                        // 右子树
                                        }
                                        }
                                        class
                                        BST
                                        {
                                        constructor
                                        (
                                        compare
                                        )
                                        {
                                        this
                                        .
                                        root =
                                        null
                                        // 树根
                                        this
                                        .
                                        size =
                                        0
                                        // 树中的节点个数
                                        this
                                        .
                                        compare =
                                        compare ||
                                        this
                                        .
                                        compare
  }
                                        compare
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        return
                                        a -
                                        b
  }
                                        add
                                        (
                                        element
                                        )
                                        {
                                        if
                                        (
                                        this
                                        .
                                        root ===
                                        null
                                        )
                                        {
                                        this
                                        .
                                        root =
                                        new
                                        Node
                                        (
                                        element,
                                        null
                                        )
                                        this
                                        .
                                        size++
                                        return
                                        }
                                        // 获取根节点 用当前添加的进行判断 放左边还是放右边
                                        let
                                        currentNode =
                                        this
                                        .
                                        root
    let
                                        compare
    let
                                        parent =
                                        null
                                        while
                                        (
                                        currentNode)
                                        {
                                        compare =
                                        this
                                        .
                                        compare
                                        (
                                        element,
                                        currentNode.
                                        element)
                                        parent =
                                        currentNode // 先将父亲保存起来
                                        // currentNode要不停的变化
                                        if
                                        (
                                        compare >
                                        0
                                        )
                                        {
                                        currentNode =
                                        currentNode.
                                        right
      }
                                        else
                                        if
                                        (
                                        compare <
                                        0
                                        )
                                        {
                                        currentNode =
                                        currentNode.
                                        left
      }
                                        else
                                        {
                                        currentNode.
                                        element =
                                        element // 相等时 先覆盖后续处理
                                        }
                                        }
                                        let
                                        newNode =
                                        new
                                        Node
                                        (
                                        element,
                                        parent)
                                        if
                                        (
                                        compare >
                                        0
                                        )
                                        {
                                        parent.
                                        right =
                                        newNode
    }
                                        else
                                        if
                                        (
                                        compare <
                                        0
                                        )
                                        {
                                        parent.
                                        left =
                                        newNode
    }
                                        this
                                        .
                                        size++
                                        }
                                        // 前序遍历
                                        preorderTraversal
                                        (
                                        visitor
                                        )
                                        {
                                        const
                                        traversal
                                        =
                                        node
                                        =>
                                        {
                                        if
                                        (
                                        node ===
                                        null
                                        )
                                        return
                                        visitor.
                                        visit
                                        (
                                        node.
                                        element)
                                        traversal
                                        (
                                        node.
                                        left)
                                        traversal
                                        (
                                        node.
                                        right)
                                        }
                                        traversal
                                        (
                                        this
                                        .
                                        root)
                                        }
                                        // 中序遍历
                                        inorderTraversal
                                        (
                                        visitor
                                        )
                                        {
                                        const
                                        traversal
                                        =
                                        node
                                        =>
                                        {
                                        if
                                        (
                                        node ===
                                        null
                                        )
                                        return
                                        traversal
                                        (
                                        node.
                                        left)
                                        visitor.
                                        visit
                                        (
                                        node.
                                        element)
                                        traversal
                                        (
                                        node.
                                        right)
                                        }
                                        traversal
                                        (
                                        this
                                        .
                                        root)
                                        }
                                        // 后序遍历
                                        posterorderTraversal
                                        (
                                        visitor
                                        )
                                        {
                                        const
                                        traversal
                                        =
                                        node
                                        =>
                                        {
                                        if
                                        (
                                        node ===
                                        null
                                        )
                                        return
                                        traversal
                                        (
                                        node.
                                        left)
                                        traversal
                                        (
                                        node.
                                        right)
                                        visitor.
                                        visit
                                        (
                                        node.
                                        element)
                                        }
                                        traversal
                                        (
                                        this
                                        .
                                        root)
                                        }
                                        // 反转二叉树：无论先序、中序、后序、层级都可以反转
                                        invertTree
                                        (
                                        )
                                        {
                                        const
                                        traversal
                                        =
                                        node
                                        =>
                                        {
                                        if
                                        (
                                        node ===
                                        null
                                        )
                                        return
                                        let
                                        temp =
                                        node.
                                        left
      node.
                                        left =
                                        node.
                                        right
      node.
                                        right =
                                        temp
      traversal
                                        (
                                        node.
                                        left)
                                        traversal
                                        (
                                        node.
                                        right)
                                        }
                                        traversal
                                        (
                                        this
                                        .
                                        root)
                                        return
                                        this
                                        .
                                        root
  }
                                        }


```
:::

先序遍历

二叉树的遍历方式

::: {.language-js .extra-class}
``` language-js

                                        // 测试
                                        var
                                        bst =
                                        new
                                        BST
                                        (
                                        (

                                            a,
                                            b

                                        )
                                        =>
                                        a.
                                        age-
                                        b.
                                        age)
                                        // 模拟sort方法
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        10
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        8
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        19
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        6
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        15
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        22
                                        }
                                        )
                                        bst.
                                        add
                                        (
                                        {
                                        age
                                        :
                                        20
                                        }
                                        )
                                        // 先序遍历
                                        // console.log(bst.preorderTraversal(),'先序遍历')
                                        // console.log(bst.inorderTraversal(),'中序遍历')
                                        // ![](https://s.poetries.work/images/20210522214837.png)
                                        // console.log(bst.posterorderTraversal(),'后序遍历')
                                        // 深度遍历：先序遍历、中序遍历、后续遍历
                                        // 广度遍历：层次遍历（同层级遍历）
                                        // 都可拿到树中的节点
                                        // 使用访问者模式
                                        class
                                        Visitor
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        visit
                                        =
                                        function
                                        (
                                        elem
                                        )
                                        {
                                        elem.
                                        age =
                                        elem.
                                        age*
                                        2
                                        }
                                        }
                                        }
                                        // bst.posterorderTraversal({
                                        //   visit(elem) {
                                        //     elem.age = elem.age*10
                                        //   }
                                        // })
                                        // 不能通过索引操作 拿到节点去操作
                                        // bst.posterorderTraversal(new Visitor())
                                        console.
                                        log
                                        (
                                        bst.
                                        invertTree
                                        (
                                        )
                                        ,
                                        '反转二叉树'
                                        )


```
:::

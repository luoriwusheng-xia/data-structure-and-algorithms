










::: {.language- .extra-class}
``` language-text
                                    {
  tag: 'DIV',
  attrs:{
  id:'app'
  },
  children: [
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] }
      ]
    },
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] },
        { tag: 'A', children: [] }
      ]
    }
  ]
}

把上面虚拟Dom转化成下方真实Dom

<div id="app "><span ><a ></a ></span ><span ><a ></a ><a ></a ></span ></div >

```
:::

实现

::: {.language-js .extra-class}
``` language-js

                                        // 真正的渲染函数
                                        function
                                        _render
                                        (
                                        vnode
                                        )
                                        {
                                        // 如果是数字类型转化为字符串
                                        if
                                        (
                                        typeof
                                        vnode ===
                                        "number "
                                        )
                                        {
                                        vnode =
                                        String
                                        (
                                        vnode)
                                        ;
                                        }
                                        // 字符串类型直接就是文本节点
                                        if
                                        (
                                        typeof
                                        vnode ===
                                        "string "
                                        )
                                        {
                                        return
                                        document.
                                        createTextNode
                                        (
                                        vnode)
                                        ;
                                        }
                                        // 普通DOM
                                        const
                                        dom =
                                        document.
                                        createElement
                                        (
                                        vnode.
                                        tag)
                                        ;
                                        if
                                        (
                                        vnode.
                                        attrs)
                                        {
                                        // 遍历属性
                                        Object.
                                        keys
                                        (
                                        vnode.
                                        attrs)
                                        .
                                        forEach
                                        (
                                        (
                                        key
                                        )
                                        =>
                                        {
                                        const
                                        value =
                                        vnode.
                                        attrs[
                                        key]
                                        ;
                                        dom.
                                        setAttribute
                                        (
                                        key,
                                        value)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        // 子数组进行递归操作
                                        vnode.
                                        children.
                                        forEach
                                        (
                                        (
                                        child
                                        )
                                        =>
                                        dom.
                                        appendChild
                                        (
                                        _render
                                        (
                                        child)
                                        )
                                        )
                                        ;
                                        return
                                        dom;
                                        }


```
:::

### [\#](#_2-实现事件总线结合vue应用){.header-anchor} 2 实现事件总线结合Vue应用 {#_2-实现事件总线结合vue应用}

> `Event Bus` （Vue、Flutter 等前端框架中有出镜）和 `Event Emitter`
> （Node中有出镜）出场的"剧组"不同，但是它们都对应一个共同的角色------**全局事件总线**
> 。

全局事件总线，严格来说不能说是观察者模式，而是发布-订阅模式。它在我们日常的业务开发中应用非常广。

> 如果只能选一道题，那这道题一定是 `Event Bus/Event Emitter`
> 的代码实现------我都说这么清楚了，这个知识点到底要不要掌握、需要掌握到什么程度，就看各位自己的了。

**在Vue中使用Event Bus来实现组件间的通讯**

> `Event Bus/Event Emitter` 作为全局事件总线，它起到的是一个**沟通桥梁**
> 的作用。我们可以把它理解为一个事件中心，我们所有事件的订阅/发布都不能由订阅方和发布方"私下沟通"，必须要委托这个事件中心帮我们实现。

在Vue中，有时候 A 组件和 B
组件中间隔了很远，看似没什么关系，但我们希望它们之间能够通信。这种情况下除了求助于
`Vuex` 之外，我们还可以通过 `Event Bus` 来实现我们的需求。

创建一个 `Event Bus` （本质上也是 Vue 实例）并导出：

::: {.language-js .extra-class}
``` language-js

                                        const
                                        EventBus =
                                        new
                                        Vue
                                        (
                                        )
                                        export
                                        default
                                        EventBus



```
:::

在主文件里引入`EventBus` ，并挂载到全局：

::: {.language-js .extra-class}
``` language-js

                                        import
                                        bus from
                                        'EventBus的文件路径'
                                        Vue
                                        .
                                        prototype.
                                        bus =
                                        bus



```
:::

订阅事件：

::: {.language-js .extra-class}
``` language-js

                                        // 这里func指someEvent这个事件的监听函数
                                        this
                                        .
                                        bus.
                                        $on
                                        (
                                        'someEvent'
                                        ,
                                        func)


```
:::

发布（触发）事件：

::: {.language-js .extra-class}
``` language-js

                                        // 这里params指someEvent这个事件被触发时回调函数接收的入参
                                        this
                                        .
                                        bus.
                                        $emit
                                        (
                                        'someEvent'
                                        ,
                                        params)


```
:::

> 大家会发现，整个调用过程中，没有出现具体的发布者和订阅者（比如上面的`PrdPublisher`
> 和`DeveloperObserver` ），全程只有`bus`
> 这个东西一个人在疯狂刷存在感。这就是全局事件总线的特点------所有事件的发布/订阅操作，必须经由事件中心，禁止一切"私下交易"！

**实现方式1**

::: {.language-js .extra-class}
``` language-js

                                        class
                                        EventEmitter
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        // handlers是一个map，用于存储事件与回调之间的对应关系
                                        this
                                        .
                                        handlers =
                                        {
                                        }
                                        }
                                        // on方法用于安装事件监听器，它接受目标事件名和回调函数作为参数
                                        on
                                        (

                                            eventName,
                                            cb

                                        )
                                        {
                                        // 先检查一下目标事件名有没有对应的监听函数队列
                                        if
                                        (
                                        !
                                        this
                                        .
                                        handlers[
                                        eventName]
                                        )
                                        {
                                        // 如果没有，那么首先初始化一个监听函数队列
                                        this
                                        .
                                        handlers[
                                        eventName]
                                        =
                                        [
                                        ]
                                        }
                                        // 把回调函数推入目标事件的监听函数队列里去
                                        this
                                        .
                                        handlers[
                                        eventName]
                                        .
                                        push
                                        (
                                        cb)
                                        }
                                        // emit方法用于触发目标事件，它接受事件名和监听函数入参作为参数
                                        emit
                                        (

                                            eventName,
                                            ...
                                            args

                                        )
                                        {
                                        // 检查目标事件是否有监听函数队列
                                        if
                                        (
                                        this
                                        .
                                        handlers[
                                        eventName]
                                        )
                                        {
                                        // 如果有，则逐个调用队列里的回调函数
                                        this
                                        .
                                        handlers[
                                        eventName]
                                        .
                                        forEach
                                        (
                                        (
                                        callback
                                        )
                                        =>
                                        {
                                        callback
                                        (
                                        ...
                                        args)
                                        }
                                        )
                                        }
                                        }
                                        // 移除某个事件回调队列里的指定回调函数
                                        off
                                        (

                                            eventName,
                                            cb

                                        )
                                        {
                                        const
                                        callbacks =
                                        this
                                        .
                                        handlers[
                                        eventName]
                                        const
                                        index =
                                        callbacks.
                                        indexOf
                                        (
                                        cb)
                                        if
                                        (
                                        index !==
                                        -
                                        1
                                        )
                                        {
                                        callbacks.
                                        splice
                                        (
                                        index,
                                        1
                                        )
                                        }
                                        }
                                        // 为事件注册单次监听器
                                        once
                                        (

                                            eventName,
                                            cb

                                        )
                                        {
                                        // 对回调函数进行包装，使其执行完毕自动被移除
                                        const
                                        wrapper
                                        =
                                        (

                                            ...
                                            args

                                        )
                                        =>
                                        {
                                        cb
                                        .
                                        apply
                                        (
                                        ...
                                        args)
                                        this
                                        .
                                        off
                                        (
                                        eventName,
                                        wrapper)
                                        }
                                        this
                                        .
                                        on
                                        (
                                        eventName,
                                        wrapper)
                                        }
                                        }


```
:::

**实现方式2**

-   **分析**
    -   `on` 和`once` 注册函数，存储起来
    -   `emit` 时找到对应的函数，执行
    -   `off` 找到对应函数，从存储中删除
-   **注意**
    -   `on` 绑定的事件可以连续执行，除非`off`
    -   `once` 绑定的函数`emit` 一次即删除，也可以未执行而被`off`

::: {.language-js .extra-class}
``` language-js

                                        class
                                        EventBus
                                        {
                                        /**
     * {
     *    'key1': [
     *        { fn: fn1, isOnce: false },
     *        { fn: fn2, isOnce: false },
     *        { fn: fn3, isOnce: true },
     *    ]
     *    'key2': [] // 有序
     *    'key3': []
     * }
     */
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        events =
                                        {
                                        }
                                        }
                                        on
                                        (

                                            type,
                                            fn,
                                            isOnce =
                                            false

                                        )
                                        {
                                        const
                                        events =
                                        this
                                        .
                                        events
        if
                                        (
                                        events[
                                        type]
                                        ==
                                        null
                                        )
                                        {
                                        events[
                                        type]
                                        =
                                        [
                                        ]
                                        // 初始化 key 的 fn 数组
                                        }
                                        events[
                                        type]
                                        .
                                        push
                                        (
                                        {
                                        fn,
                                        isOnce }
                                        )
                                        }
                                        once
                                        (

                                            type,
                                            fn

                                        )
                                        {
                                        this
                                        .
                                        on
                                        (
                                        type,
                                        fn,
                                        true
                                        )
                                        }
                                        off
                                        (

                                            type,
                                            fn

                                        )
                                        {
                                        if
                                        (
                                        !
                                        fn)
                                        {
                                        // 解绑所有 type 的函数
                                        this
                                        .
                                        events[
                                        type]
                                        =
                                        [
                                        ]
                                        }
                                        else
                                        {
                                        // 解绑单个 fn
                                        const
                                        fnList =
                                        this
                                        .
                                        events[
                                        type]
                                        if
                                        (
                                        fnList)
                                        {
                                        this
                                        .
                                        events[
                                        type]
                                        =
                                        fnList.
                                        filter
                                        (
                                        item
                                        =>
                                        item.
                                        fn !==
                                        fn)
                                        }
                                        }
                                        }
                                        emit
                                        (

                                            type,
                                            ...
                                            args

                                        )
                                        {
                                        const
                                        fnList =
                                        this
                                        .
                                        events[
                                        type]
                                        if
                                        (
                                        fnList ==
                                        null
                                        )
                                        return
                                        // 注意过滤后重新赋值
                                        this
                                        .
                                        events[
                                        type]
                                        =
                                        fnList.
                                        filter
                                        (
                                        item
                                        =>
                                        {
                                        const
                                        {
                                        fn,
                                        isOnce }
                                        =
                                        item
            fn
                                        (
                                        ...
                                        args)
                                        // once 执行一次就要被过滤掉
                                        if
                                        (
                                        !
                                        isOnce)
                                        return
                                        true
                                        return
                                        false
                                        }
                                        )
                                        }
                                        }


```
:::

**实现方式3：拆分保存 on 和 once 事件**

::: {.language-js .extra-class}
``` language-js

                                        // 拆分保存 on 和 once 事件
                                        class
                                        EventBus
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        events =
                                        {
                                        }
                                        // { key1: [fn1, fn2], key2: [fn1, fn2] }
                                        this
                                        .
                                        onceEvents =
                                        {
                                        }
                                        }
                                        on
                                        (

                                            type,
                                            fn

                                        )
                                        {
                                        const
                                        events =
                                        this
                                        .
                                        events
        if
                                        (
                                        events[
                                        type]
                                        ==
                                        null
                                        )
                                        events[
                                        type]
                                        =
                                        [
                                        ]
                                        events[
                                        type]
                                        .
                                        push
                                        (
                                        fn)
                                        }
                                        once
                                        (

                                            type,
                                            fn

                                        )
                                        {
                                        const
                                        onceEvents =
                                        this
                                        .
                                        onceEvents
        if
                                        (
                                        onceEvents[
                                        type]
                                        ==
                                        null
                                        )
                                        onceEvents[
                                        type]
                                        =
                                        [
                                        ]
                                        onceEvents[
                                        type]
                                        .
                                        push
                                        (
                                        fn)
                                        }
                                        off
                                        (

                                            type,
                                            fn

                                        )
                                        {
                                        if
                                        (
                                        !
                                        fn)
                                        {
                                        // 解绑所有事件
                                        this
                                        .
                                        events[
                                        type]
                                        =
                                        [
                                        ]
                                        this
                                        .
                                        onceEvents[
                                        type]
                                        =
                                        [
                                        ]
                                        }
                                        else
                                        {
                                        // 解绑单个事件
                                        const
                                        fnList =
                                        this
                                        .
                                        events[
                                        type]
                                        const
                                        onceFnList =
                                        this
                                        .
                                        onceEvents[
                                        type]
                                        if
                                        (
                                        fnList)
                                        {
                                        this
                                        .
                                        events[
                                        type]
                                        =
                                        fnList.
                                        filter
                                        (
                                        curFn
                                        =>
                                        curFn !==
                                        fn)
                                        }
                                        if
                                        (
                                        onceFnList)
                                        {
                                        this
                                        .
                                        onceEvents[
                                        type]
                                        =
                                        onceFnList.
                                        filter
                                        (
                                        curFn
                                        =>
                                        curFn !==
                                        fn)
                                        }
                                        }
                                        }
                                        emit
                                        (

                                            type,
                                            ...
                                            args

                                        )
                                        {
                                        const
                                        fnList =
                                        this
                                        .
                                        events[
                                        type]
                                        const
                                        onceFnList =
                                        this
                                        .
                                        onceEvents[
                                        type]
                                        if
                                        (
                                        fnList)
                                        {
                                        fnList.
                                        forEach
                                        (
                                        f
                                        =>
                                        f
                                        (
                                        ...
                                        args)
                                        )
                                        }
                                        if
                                        (
                                        onceFnList)
                                        {
                                        onceFnList.
                                        forEach
                                        (
                                        f
                                        =>
                                        f
                                        (
                                        ...
                                        args)
                                        )
                                        // once 执行一次就删除
                                        this
                                        .
                                        onceEvents[
                                        type]
                                        =
                                        [
                                        ]
                                        }
                                        }
                                        }


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 测试
                                        const
                                        e =
                                        new
                                        EventBus
                                        (
                                        )
                                        function
                                        fn1
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        console.
                                        log
                                        (
                                        'fn1'
                                        ,
                                        a,
                                        b)
                                        }
                                        function
                                        fn2
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        console.
                                        log
                                        (
                                        'fn2'
                                        ,
                                        a,
                                        b)
                                        }
                                        function
                                        fn3
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        console.
                                        log
                                        (
                                        'fn3'
                                        ,
                                        a,
                                        b)
                                        }
                                        e.
                                        on
                                        (
                                        'key1'
                                        ,
                                        fn1)
                                        e.
                                        on
                                        (
                                        'key1'
                                        ,
                                        fn2)
                                        e.
                                        once
                                        (
                                        'key1'
                                        ,
                                        fn3)
                                        e.
                                        on
                                        (
                                        'xxxxxx'
                                        ,
                                        fn3)
                                        e.
                                        emit
                                        (
                                        'key1'
                                        ,
                                        10
                                        ,
                                        20
                                        )
                                        // 触发 fn1 fn2 fn3
                                        e.
                                        off
                                        (
                                        'key1'
                                        ,
                                        fn1)
                                        e.
                                        emit
                                        (
                                        'key1'
                                        ,
                                        100
                                        ,
                                        200
                                        )
                                        // 触发 fn2


```
:::

> 在日常的开发中，大家用到`EventBus/EventEmitter`
> 往往提供比这五个方法多的多的多的方法。但在面试过程中，如果大家能够完整地实现出这五个方法，已经非常可以说明问题了，因此这个`EventBus`
> 希望大家可以熟练掌握。学有余力的同学，推荐阅读
> [FaceBook推出的通用EventEmiiter库的源码
> ![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtaGlkZGVuPSJ0cnVlIiBmb2N1c2FibGU9ImZhbHNlIiB4PSIwcHgiIHk9IjBweCIgdmlld2JveD0iMCAwIDEwMCAxMDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9Imljb24gb3V0Ym91bmQiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOC44LDg1LjFoNTZsMCwwYzIuMiwwLDQtMS44LDQtNHYtMzJoLTh2MjhoLTQ4di00OGgyOHYtOGgtMzJsMCwwYy0yLjIsMC00LDEuOC00LDR2NTZDMTQuOCw4My4zLDE2LjYsODUuMSwxOC44LDg1LjF6Ij48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGZpbGw9ImN1cnJlbnRDb2xvciIgcG9pbnRzPSI0NS43LDQ4LjcgNTEuMyw1NC4zIDc3LjIsMjguNSA3Ny4yLDM3LjIgODUuMiwzNy4yIDg1LjIsMTQuOSA2Mi44LDE0LjkgNjIuOCwyMi45IDcxLjUsMjIuOSI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPg==){.icon
> .outbound} [(opens new window)]{.sr-only}
> ](https://github.com/facebook/emitter){target="_blank"
> rel="noopener noreferrer"} ，相信你会有更多收获。

### [\#](#_3-实现一个双向绑定){.header-anchor} 3 实现一个双向绑定 {#_3-实现一个双向绑定}

**defineProperty 版本**

::: {.language-js .extra-class}
``` language-js

                                        // 数据
                                        const
                                        data =
                                        {
                                        text
                                        :
                                        'default'
                                        }
                                        ;
                                        const
                                        input =
                                        document.
                                        getElementById
                                        (
                                        'input'
                                        )
                                        ;
                                        const
                                        span =
                                        document.
                                        getElementById
                                        (
                                        'span'
                                        )
                                        ;
                                        // 数据劫持
                                        Object.
                                        defineProperty
                                        (
                                        data,
                                        'text'
                                        ,
                                        {
                                        // 数据变化 -->修改视图
                                        set
                                        (
                                        newVal)
                                        {
                                        input.
                                        value =
                                        newVal;
                                        span.
                                        innerHTML =
                                        newVal;
                                        }
                                        }
                                        )
                                        ;
                                        // 视图更改 -->数据变化
                                        input.
                                        addEventListener
                                        (
                                        'keyup'
                                        ,
                                        function
                                        (
                                        e
                                        )
                                        {
                                        data.
                                        text =
                                        e.
                                        target.
                                        value;
                                        }
                                        )
                                        ;


```
:::

**proxy 版本**

::: {.language-js .extra-class}
``` language-js

                                        // 数据
                                        const
                                        data =
                                        {
                                        text
                                        :
                                        'default'
                                        }
                                        ;
                                        const
                                        input =
                                        document.
                                        getElementById
                                        (
                                        'input'
                                        )
                                        ;
                                        const
                                        span =
                                        document.
                                        getElementById
                                        (
                                        'span'
                                        )
                                        ;
                                        // 数据劫持
                                        const
                                        handler =
                                        {
                                        set
                                        (
                                        target,
                                        key,
                                        value)
                                        {
                                        target[
                                        key]
                                        =
                                        value;
                                        // 数据变化 -->修改视图
                                        input.
                                        value =
                                        value;
                                        span.
                                        innerHTML =
                                        value;
                                        return
                                        value;
                                        }
                                        }
                                        ;
                                        const
                                        proxy =
                                        new
                                        Proxy
                                        (
                                        data,
                                        handler)
                                        ;
                                        // 视图更改 -->数据变化
                                        input.
                                        addEventListener
                                        (
                                        'keyup'
                                        ,
                                        function
                                        (
                                        e
                                        )
                                        {
                                        proxy.
                                        text =
                                        e.
                                        target.
                                        value;
                                        }
                                        )
                                        ;


```
:::

### [\#](#_4-实现一个简易的mvvm){.header-anchor} 4 实现一个简易的MVVM {#_4-实现一个简易的mvvm}

> 实现一个简易的`MVVM` 我会分为这么几步来：

1.  首先我会定义一个类`Vue` ，这个类接收的是一个`options`
    ，那么其中可能有需要挂载的根元素的`id` ，也就是`el`
    属性；然后应该还有一个`data` 属性，表示需要双向绑定的数据
2.  其次我会定义一个`Dep` 类，这个类产生的实例对象中会定义一个`subs`
    数组用来存放所依赖这个属性的依赖，已经添加依赖的方法`addSub`
    ，删除方法`removeSub` ，还有一个`notify` 方法用来遍历更新它`subs`
    中的所有依赖，同时Dep类有一个静态属性`target`
    它用来表示当前的观察者，当后续进行依赖收集的时候可以将它添加到`dep.subs`
    中。
3.  然后设计一个`observe` 方法，这个方法接收的是传进来的`data`
    ，也就是`options.data` ，里面会遍历`data`
    中的每一个属性，并使用`Object.defineProperty()` 来重写它的`get`
    和`set` ，那么这里面呢可以使用`new Dep()` 实例化一个`dep`
    对象，在`get` 的时候调用其`addSub` 方法添加当前的观察者`Dep.target`
    完成依赖收集，并且在`set` 的时候调用`dep.notify`
    方法来通知每一个依赖它的观察者进行更新
4.  完成这些之后，我们还需要一个`compile`
    方法来将HTML模版和数据结合起来。在这个方法中首先传入的是一个`node`
    节点，然后遍历它的所有子级，判断是否有`firstElmentChild`
    ，有的话则进行递归调用compile方法，没有`firstElementChild`
    的话且该`child.innderHTML` 用正则匹配满足有`/\{\{(.*)\}\}/`
    项的话则表示有需要双向绑定的数据，那么就将用正则`new Reg('\\{\\{\\s*' + key + '\\s*\\}\\}', 'gm')`
    替换掉 是其为`msg` 变量。
5.  完成变量替换的同时，还需要将`Dep.target` 指向当前的这个`child`
    ，且调用一下`this.opt.data[key]` ，也就是为了触发这个数据的`get`
    来对当前的`child`
    进行依赖收集，这样下次数据变化的时候就能通知`child`
    进行视图更新了，不过在最后要记得将`Dep.target` 指为`null`
    哦(其实在`Vue` 中是有一个`targetStack` 栈用来存放`target` 的指向的)
6.  那么最后我们只需要监听`document` 的`DOMContentLoaded`
    然后在回调函数中实例化这个`Vue` 对象就可以了

**coding** :

需要注意的点：

-   `childNodes`
    会获取到所有的子节点以及文本节点(包括元素标签中的空白节点)
-   `firstElementChild`
    表示获取元素的第一个字元素节点，以此来区分是不是元素节点，如果是的话则调用`compile`
    进行递归调用，否则用正则匹配
-   这里面的正则真的不难，大家可以看一下

完整代码如下：

::: {.language-html .extra-class}
``` language-html


                                            <!
                                            DOCTYPE
                                            html
                                            >



                                                <
                                                html

                                            lang

                                                =
                                                "
                                                en"

                                            >



                                                <
                                                head

                                            >



                                                <
                                                meta

                                            charset

                                                =
                                                "
                                                UTF-8"

                                            />



                                                <
                                                meta

                                            name

                                                =
                                                "
                                                viewport"

                                            content

                                                =
                                                "
                                                width=device-width, initial-scale=1.0"

                                            />



                                                <
                                                meta

                                            http-equiv

                                                =
                                                "
                                                X-UA-Compatible"

                                            content

                                                =
                                                "
                                                ie=edge"

                                            />



                                                <
                                                title

                                            >

                                        MVVM


                                                </
                                                title

                                            >



                                                </
                                                head

                                            >



                                                <
                                                body

                                            >



                                                <
                                                div

                                            id

                                                =
                                                "
                                                app"

                                            >



                                                <
                                                h3

                                            >

                                        姓名


                                                </
                                                h3

                                            >



                                                <
                                                p

                                            >

                                        {{name}}


                                                </
                                                p

                                            >



                                                <
                                                h3

                                            >

                                        年龄


                                                </
                                                h3

                                            >



                                                <
                                                p

                                            >

                                        {{age}}


                                                </
                                                p

                                            >



                                                </
                                                div

                                            >



                                                </
                                                body

                                            >



                                                </
                                                html

                                            >



                                                <
                                                script

                                            >



                                                document.
                                                addEventListener
                                                (
                                                "DOMContentLoaded "
                                                ,
                                                function
                                                (
                                                )
                                                {
                                                let
                                                opt =
                                                {
                                                el
                                                :
                                                "#app "
                                                ,
                                                data
                                                :
                                                {
                                                name
                                                :
                                                "等待修改..."
                                                ,
                                                age
                                                :
                                                20
                                                }
                                                }
                                                ;
                                                let
                                                vm =
                                                new
                                                Vue
                                                (
                                                opt)
                                                ;
                                                setTimeout
                                                (
                                                (
                                                )
                                                =>
                                                {
                                                opt.
                                                data.
                                                name =
                                                "jing "
                                                ;
                                                }
                                                ,
                                                2000
                                                )
                                                ;
                                                }
                                                ,
                                                false
                                                )
                                                ;
                                                class
                                                Vue
                                                {
                                                constructor
                                                (
                                                opt
                                                )
                                                {
                                                this
                                                .
                                                opt =
                                                opt;
                                                this
                                                .
                                                observer
                                                (
                                                opt.
                                                data)
                                                ;
                                                let
                                                root =
                                                document.
                                                querySelector
                                                (
                                                opt.
                                                el)
                                                ;
                                                this
                                                .
                                                compile
                                                (
                                                root)
                                                ;
                                                }
                                                observer
                                                (
                                                data
                                                )
                                                {
                                                Object.
                                                keys
                                                (
                                                data)
                                                .
                                                forEach
                                                (
                                                (
                                                key
                                                )
                                                =>
                                                {
                                                let
                                                obv =
                                                new
                                                Dep
                                                (
                                                )
                                                ;
                                                data[
                                                "_ "
                                                +
                                                key]
                                                =
                                                data[
                                                key]
                                                ;
                                                Object.
                                                defineProperty
                                                (
                                                data,
                                                key,
                                                {
                                                get
                                                (
                                                )
                                                {
                                                Dep.
                                                target &&
                                                obv.
                                                addSubNode
                                                (
                                                Dep.
                                                target)
                                                ;
                                                return
                                                data[
                                                "_ "
                                                +
                                                key]
                                                ;
                                                }
                                                ,
                                                set
                                                (
                                                newVal)
                                                {
                                                obv.
                                                update
                                                (
                                                newVal)
                                                ;
                                                data[
                                                "_ "
                                                +
                                                key]
                                                =
                                                newVal;
                                                }
                                                ,
                                                }
                                                )
                                                ;
                                                }
                                                )
                                                ;
                                                }
                                                compile
                                                (
                                                node
                                                )
                                                {
                                                [
                                                ]
                                                .
                                                forEach
                                                .
                                                call
                                                (
                                                node.
                                                childNodes,
                                                (
                                                child
                                                )
                                                =>
                                                {
                                                if
                                                (
                                                !
                                                child.
                                                firstElementChild &&

                                                    /
                                                    \{\{(.*)\}\}
                                                    /

                                                .
                                                test
                                                (
                                                child.
                                                innerHTML)
                                                )
                                                {
                                                let
                                                key =
                                                RegExp.
                                                $1.
                                                trim
                                                (
                                                )
                                                ;
                                                child.
                                                innerHTML =
                                                child.
                                                innerHTML.
                                                replace
                                                (
                                                new
                                                RegExp
                                                (
                                                "\\{\\{\\s*"
                                                +
                                                key +
                                                "\\s*\\}\\}"
                                                ,
                                                "gm "
                                                )
                                                ,
                                                this
                                                .
                                                opt.
                                                data[
                                                key]
                                                )
                                                ;
                                                Dep.
                                                target =
                                                child;
                                                this
                                                .
                                                opt.
                                                data[
                                                key]
                                                ;
                                                Dep.
                                                target =
                                                null
                                                ;
                                                }
                                                else
                                                if
                                                (
                                                child.
                                                firstElementChild)
                                                this
                                                .
                                                compile
                                                (
                                                child)
                                                ;
                                                }
                                                )
                                                ;
                                                }
                                                }
                                                class
                                                Dep
                                                {
                                                constructor
                                                (
                                                )
                                                {
                                                this
                                                .
                                                subNode =
                                                [
                                                ]
                                                ;
                                                }
                                                addSubNode
                                                (
                                                node
                                                )
                                                {
                                                this
                                                .
                                                subNode.
                                                push
                                                (
                                                node)
                                                ;
                                                }
                                                update
                                                (
                                                newVal
                                                )
                                                {
                                                this
                                                .
                                                subNode.
                                                forEach
                                                (
                                                (
                                                node
                                                )
                                                =>
                                                {
                                                node.
                                                innerHTML =
                                                newVal;
                                                }
                                                )
                                                ;
                                                }
                                                }




                                                </
                                                script

                                            >



```
:::

**简化版2**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        update
                                        (
                                        )
                                        {
                                        console.
                                        log
                                        (
                                        '数据变化~~~ mock update view'
                                        )
                                        }
                                        let
                                        obj =
                                        [
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ]
                                        // 变异方法 push shift unshfit reverse sort splice pop
                                        // Object.defineProperty
                                        let
                                        oldProto =
                                        Array
                                        .
                                        prototype;
                                        let
                                        proto =
                                        Object.
                                        create
                                        (
                                        oldProto)
                                        ;
                                        // 克隆了一分
                                        [
                                        'push'
                                        ,
                                        'shift'
                                        ]
                                        .
                                        forEach
                                        (
                                        item
                                        =>
                                        {
                                        proto[
                                        item]
                                        =
                                        function
                                        (
                                        )
                                        {
                                        update
                                        (
                                        )
                                        ;
                                        oldProto[
                                        item]
                                        .
                                        apply
                                        (
                                        this
                                        ,
                                        arguments)
                                        ;
                                        }
                                        }
                                        )
                                        function
                                        observer
                                        (
                                        value
                                        )
                                        {
                                        // proxy reflect
                                        if
                                        (
                                        Array.
                                        isArray
                                        (
                                        value)
                                        )
                                        {
                                        // AOP
                                        return
                                        value.
                                        __proto__ =
                                        proto;
                                        // 重写 这个数组里的push shift unshfit reverse sort splice pop
                                        }
                                        if
                                        (
                                        typeof
                                        value !==
                                        'object'
                                        )
                                        {
                                        return
                                        value;
                                        }
                                        for
                                        (
                                        let
                                        key in
                                        value)
                                        {
                                        defineReactive
                                        (
                                        value,
                                        key,
                                        value[
                                        key]
                                        )
                                        ;
                                        }
                                        }
                                        function
                                        defineReactive
                                        (

                                            obj,
                                            key,
                                            value

                                        )
                                        {
                                        observer
                                        (
                                        value)
                                        ;
                                        // 如果是对象 继续增加getter和setter
                                        Object.
                                        defineProperty
                                        (
                                        obj,
                                        key,
                                        {
                                        get
                                        (
                                        )
                                        {
                                        return
                                        value;
                                        }
                                        ,
                                        set
                                        (
                                        newValue)
                                        {
                                        if
                                        (
                                        newValue !==
                                        value)
                                        {
                                        observer
                                        (
                                        newValue)
                                        ;
                                        value =
                                        newValue;
                                        update
                                        (
                                        )
                                        ;
                                        }
                                        }
                                        }
                                        )
                                        }
                                        observer
                                        (
                                        obj)
                                        ;
                                        // AOP
                                        // obj.name = {n:200}; // 数据变了 需要更新视图 深度监控
                                        // obj.name.n = 100;
                                        obj.
                                        push
                                        (
                                        123
                                        )
                                        ;
                                        obj.
                                        push
                                        (
                                        456
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        obj)
                                        ;


```
:::

### [\#](#_5-实现一个迷你版的vue){.header-anchor} 5 实现一个迷你版的vue {#_5-实现一个迷你版的vue}

**入口**

::: {.language-js .extra-class}
``` language-js

                                        // js/vue.js
                                        class
                                        Vue
                                        {
                                        constructor
                                        (
                                        options
                                        )
                                        {
                                        // 1. 通过属性保存选项的数据
                                        this
                                        .
                                        $options =
                                        options ||
                                        {
                                        }
                                        this
                                        .
                                        $data =
                                        options.
                                        data ||
                                        {
                                        }
                                        this
                                        .
                                        $el =
                                        typeof
                                        options.
                                        el ===
                                        'string'
                                        ?
                                        document.
                                        querySelector
                                        (
                                        options.
                                        el)
                                        :
                                        options.
                                        el
    // 2. 把data中的成员转换成getter和setter，注入到vue实例中
                                        this
                                        .
                                        _proxyData
                                        (
                                        this
                                        .
                                        $data)
                                        // 3. 调用observer对象，监听数据的变化
                                        new
                                        Observer
                                        (
                                        this
                                        .
                                        $data)
                                        // 4. 调用compiler对象，解析指令和差值表达式
                                        new
                                        Compiler
                                        (
                                        this
                                        )
                                        }
                                        _proxyData
                                        (
                                        data
                                        )
                                        {
                                        // 遍历data中的所有属性
                                        Object.
                                        keys
                                        (
                                        data)
                                        .
                                        forEach
                                        (
                                        key
                                        =>
                                        {
                                        // 把data的属性注入到vue实例中
                                        Object.
                                        defineProperty
                                        (
                                        this
                                        ,
                                        key,
                                        {
                                        enumerable
                                        :
                                        true
                                        ,
                                        configurable
                                        :
                                        true
                                        ,
                                        get
                                        (
                                        )
                                        {
                                        return
                                        data[
                                        key]
                                        }
                                        ,
                                        set
                                        (
                                        newValue)
                                        {
                                        if
                                        (
                                        newValue ===
                                        data[
                                        key]
                                        )
                                        {
                                        return
                                        }
                                        data[
                                        key]
                                        =
                                        newValue
        }
                                        }
                                        )
                                        }
                                        )
                                        }
                                        }


```
:::

**实现Dep**

::: {.language-js .extra-class}
``` language-js

                                        class
                                        Dep
                                        {
                                        constructor
                                        (
                                        )
                                        {
                                        // 存储所有的观察者
                                        this
                                        .
                                        subs =
                                        [
                                        ]
                                        }
                                        // 添加观察者
                                        addSub
                                        (
                                        sub
                                        )
                                        {
                                        if
                                        (
                                        sub &&
                                        sub.
                                        update)
                                        {
                                        this
                                        .
                                        subs.
                                        push
                                        (
                                        sub)
                                        }
                                        }
                                        // 发送通知
                                        notify
                                        (
                                        )
                                        {
                                        this
                                        .
                                        subs.
                                        forEach
                                        (
                                        sub
                                        =>
                                        {
                                        sub.
                                        update
                                        (
                                        )
                                        }
                                        )
                                        }
                                        }


```
:::

**实现watcher**

::: {.language-js .extra-class}
``` language-js

                                        class
                                        Watcher
                                        {
                                        constructor
                                        (

                                            vm,
                                            key,
                                            cb

                                        )
                                        {
                                        this
                                        .
                                        vm =
                                        vm
    // data中的属性名称
                                        this
                                        .
                                        key =
                                        key
    // 回调函数负责更新视图
                                        this
                                        .
                                        cb =
                                        cb

    // 把watcher对象记录到Dep类的静态属性target
                                        Dep.
                                        target =
                                        this
                                        // 触发get方法，在get方法中会调用addSub
                                        this
                                        .
                                        oldValue =
                                        vm[
                                        key]
                                        Dep.
                                        target =
                                        null
                                        }
                                        // 当数据发生变化的时候更新视图
                                        update
                                        (
                                        )
                                        {
                                        let
                                        newValue =
                                        this
                                        .
                                        vm[
                                        this
                                        .
                                        key]
                                        if
                                        (
                                        this
                                        .
                                        oldValue ===
                                        newValue)
                                        {
                                        return
                                        }
                                        this
                                        .
                                        cb
                                        (
                                        newValue)
                                        }
                                        }


```
:::

**实现compiler**

::: {.language-js .extra-class}
``` language-js

                                        class
                                        Compiler
                                        {
                                        constructor
                                        (
                                        vm
                                        )
                                        {
                                        this
                                        .
                                        el =
                                        vm.
                                        $el
    this
                                        .
                                        vm =
                                        vm
    this
                                        .
                                        compile
                                        (
                                        this
                                        .
                                        el)
                                        }
                                        // 编译模板，处理文本节点和元素节点
                                        compile
                                        (
                                        el
                                        )
                                        {
                                        let
                                        childNodes =
                                        el.
                                        childNodes
    Array.
                                        from
                                        (
                                        childNodes)
                                        .
                                        forEach
                                        (
                                        node
                                        =>
                                        {
                                        // 处理文本节点
                                        if
                                        (
                                        this
                                        .
                                        isTextNode
                                        (
                                        node)
                                        )
                                        {
                                        this
                                        .
                                        compileText
                                        (
                                        node)
                                        }
                                        else
                                        if
                                        (
                                        this
                                        .
                                        isElementNode
                                        (
                                        node)
                                        )
                                        {
                                        // 处理元素节点
                                        this
                                        .
                                        compileElement
                                        (
                                        node)
                                        }
                                        // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
                                        if
                                        (
                                        node.
                                        childNodes &&
                                        node.
                                        childNodes.
                                        length)
                                        {
                                        this
                                        .
                                        compile
                                        (
                                        node)
                                        }
                                        }
                                        )
                                        }
                                        // 编译元素节点，处理指令
                                        compileElement
                                        (
                                        node
                                        )
                                        {
                                        // console.log(node.attributes)
                                        // 遍历所有的属性节点
                                        Array.
                                        from
                                        (
                                        node.
                                        attributes)
                                        .
                                        forEach
                                        (
                                        attr
                                        =>
                                        {
                                        // 判断是否是指令
                                        let
                                        attrName =
                                        attr.
                                        name
      if
                                        (
                                        this
                                        .
                                        isDirective
                                        (
                                        attrName)
                                        )
                                        {
                                        // v-text -->text
                                        attrName =
                                        attrName.
                                        substr
                                        (
                                        2
                                        )
                                        let
                                        key =
                                        attr.
                                        value
        this
                                        .
                                        update
                                        (
                                        node,
                                        key,
                                        attrName)
                                        }
                                        }
                                        )
                                        }
                                        update
                                        (

                                            node,
                                            key,
                                            attrName

                                        )
                                        {
                                        let
                                        updateFn =
                                        this
                                        [
                                        attrName +
                                        'Updater'
                                        ]
                                        updateFn &&
                                        updateFn
                                        .
                                        call
                                        (
                                        this
                                        ,
                                        node,
                                        this
                                        .
                                        vm[
                                        key]
                                        ,
                                        key)
                                        }
                                        // 处理 v-text 指令
                                        textUpdater
                                        (

                                            node,
                                            value,
                                            key

                                        )
                                        {
                                        node.
                                        textContent =
                                        value
    new
                                        Watcher
                                        (
                                        this
                                        .
                                        vm,
                                        key,
                                        (
                                        newValue
                                        )
                                        =>
                                        {
                                        node.
                                        textContent =
                                        newValue
    }
                                        )
                                        }
                                        // v-model
                                        modelUpdater
                                        (

                                            node,
                                            value,
                                            key

                                        )
                                        {
                                        node.
                                        value =
                                        value
    new
                                        Watcher
                                        (
                                        this
                                        .
                                        vm,
                                        key,
                                        (
                                        newValue
                                        )
                                        =>
                                        {
                                        node.
                                        value =
                                        newValue
    }
                                        )
                                        // 双向绑定
                                        node.
                                        addEventListener
                                        (
                                        'input'
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        this
                                        .
                                        vm[
                                        key]
                                        =
                                        node.
                                        value
    }
                                        )
                                        }
                                        // 编译文本节点，处理差值表达式
                                        compileText
                                        (
                                        node
                                        )
                                        {
                                        // console.dir(node)
                                        // {{  msg }}
                                        let
                                        reg =

                                            /
                                            \{\{(.+?)\}\}
                                            /

                                        let
                                        value =
                                        node.
                                        textContent
    if
                                        (
                                        reg.
                                        test
                                        (
                                        value)
                                        )
                                        {
                                        let
                                        key =
                                        RegExp.
                                        $1.
                                        trim
                                        (
                                        )
                                        node.
                                        textContent =
                                        value.
                                        replace
                                        (
                                        reg,
                                        this
                                        .
                                        vm[
                                        key]
                                        )
                                        // 创建watcher对象，当数据改变更新视图
                                        new
                                        Watcher
                                        (
                                        this
                                        .
                                        vm,
                                        key,
                                        (
                                        newValue
                                        )
                                        =>
                                        {
                                        node.
                                        textContent =
                                        newValue
      }
                                        )
                                        }
                                        }
                                        // 判断元素属性是否是指令
                                        isDirective
                                        (
                                        attrName
                                        )
                                        {
                                        return
                                        attrName.
                                        startsWith
                                        (
                                        'v-'
                                        )
                                        }
                                        // 判断节点是否是文本节点
                                        isTextNode
                                        (
                                        node
                                        )
                                        {
                                        return
                                        node.
                                        nodeType ===
                                        3
                                        }
                                        // 判断节点是否是元素节点
                                        isElementNode
                                        (
                                        node
                                        )
                                        {
                                        return
                                        node.
                                        nodeType ===
                                        1
                                        }
                                        }


```
:::

**实现Observer**

::: {.language-js .extra-class}
``` language-js

                                        class
                                        Observer
                                        {
                                        constructor
                                        (
                                        data
                                        )
                                        {
                                        this
                                        .
                                        walk
                                        (
                                        data)
                                        }
                                        walk
                                        (
                                        data
                                        )
                                        {
                                        // 1. 判断data是否是对象
                                        if
                                        (
                                        !
                                        data ||
                                        typeof
                                        data !==
                                        'object'
                                        )
                                        {
                                        return
                                        }
                                        // 2. 遍历data对象的所有属性
                                        Object.
                                        keys
                                        (
                                        data)
                                        .
                                        forEach
                                        (
                                        key
                                        =>
                                        {
                                        this
                                        .
                                        defineReactive
                                        (
                                        data,
                                        key,
                                        data[
                                        key]
                                        )
                                        }
                                        )
                                        }
                                        defineReactive
                                        (

                                            obj,
                                            key,
                                            val

                                        )
                                        {
                                        let
                                        that =
                                        this
                                        // 负责收集依赖，并发送通知
                                        let
                                        dep =
                                        new
                                        Dep
                                        (
                                        )
                                        // 如果val是对象，把val内部的属性转换成响应式数据
                                        this
                                        .
                                        walk
                                        (
                                        val)
                                        Object.
                                        defineProperty
                                        (
                                        obj,
                                        key,
                                        {
                                        enumerable
                                        :
                                        true
                                        ,
                                        configurable
                                        :
                                        true
                                        ,
                                        get
                                        (
                                        )
                                        {
                                        // 收集依赖
                                        Dep.
                                        target &&
                                        dep.
                                        addSub
                                        (
                                        Dep.
                                        target)
                                        return
                                        val
      }
                                        ,
                                        set
                                        (
                                        newValue)
                                        {
                                        if
                                        (
                                        newValue ===
                                        val)
                                        {
                                        return
                                        }
                                        val =
                                        newValue
        that.
                                        walk
                                        (
                                        newValue)
                                        // 发送通知
                                        dep.
                                        notify
                                        (
                                        )
                                        }
                                        }
                                        )
                                        }
                                        }


```
:::

**使用**

::: {.language-html .extra-class}
``` language-html


                                            <!
                                            DOCTYPE
                                            html
                                            >



                                                <
                                                html

                                            lang

                                                =
                                                "
                                                cn"

                                            >



                                                <
                                                head

                                            >



                                                <
                                                meta

                                            charset

                                                =
                                                "
                                                UTF-8"

                                            >



                                                <
                                                meta

                                            name

                                                =
                                                "
                                                viewport"

                                            content

                                                =
                                                "
                                                width=device-width, initial-scale=1.0"

                                            >



                                                <
                                                meta

                                            http-equiv

                                                =
                                                "
                                                X-UA-Compatible"

                                            content

                                                =
                                                "
                                                ie=edge"

                                            >



                                                <
                                                title

                                            >

                                        Mini Vue


                                                </
                                                title

                                            >



                                                </
                                                head

                                            >



                                                <
                                                body

                                            >



                                                <
                                                div

                                            id

                                                =
                                                "
                                                app"

                                            >



                                                <
                                                h1

                                            >

                                        差值表达式


                                                </
                                                h1

                                            >



                                                <
                                                h3

                                            >

                                        {{ msg }}


                                                </
                                                h3

                                            >



                                                <
                                                h3

                                            >

                                        {{ count }}


                                                </
                                                h3

                                            >



                                                <
                                                h1

                                            >

                                        v-text


                                                </
                                                h1

                                            >



                                                <
                                                div

                                            v-text

                                                =
                                                "
                                                msg"

                                            >



                                                </
                                                div

                                            >



                                                <
                                                h1

                                            >

                                        v-model


                                                </
                                                h1

                                            >



                                                <
                                                input

                                            type

                                                =
                                                "
                                                text"

                                            v-model

                                                =
                                                "
                                                msg"

                                            >



                                                <
                                                input

                                            type

                                                =
                                                "
                                                text"

                                            v-model

                                                =
                                                "
                                                count"

                                            >



                                                </
                                                div

                                            >



                                                <
                                                script

                                            src

                                                =
                                                "
                                                ./js/dep.js"

                                            >




                                                </
                                                script

                                            >



                                                <
                                                script

                                            src

                                                =
                                                "
                                                ./js/watcher.js"

                                            >




                                                </
                                                script

                                            >



                                                <
                                                script

                                            src

                                                =
                                                "
                                                ./js/compiler.js"

                                            >




                                                </
                                                script

                                            >



                                                <
                                                script

                                            src

                                                =
                                                "
                                                ./js/observer.js"

                                            >




                                                </
                                                script

                                            >



                                                <
                                                script

                                            src

                                                =
                                                "
                                                ./js/vue.js"

                                            >




                                                </
                                                script

                                            >



                                                <
                                                script

                                            >



                                                let
                                                vm =
                                                new
                                                Vue
                                                (
                                                {
                                                el
                                                :
                                                '#app'
                                                ,
                                                data
                                                :
                                                {
                                                msg
                                                :
                                                'Hello Vue'
                                                ,
                                                count
                                                :
                                                100
                                                ,
                                                person
                                                :
                                                {
                                                name
                                                :
                                                'zs'
                                                }
                                                }
                                                }
                                                )
                                                console.
                                                log
                                                (
                                                vm.
                                                msg)
                                                // vm.msg = { test: 'Hello' }
                                                vm.
                                                test =
                                                'abc'




                                                </
                                                script

                                            >



                                                </
                                                body

                                            >



                                                </
                                                html

                                            >



```
:::

### [\#](#_6-实现vue-reactive响应式){.header-anchor} 6 实现Vue reactive响应式 {#_6-实现vue-reactive响应式}

::: {.language-js .extra-class}
``` language-js

                                        // Dep module
                                        class
                                        Dep
                                        {
                                        static
                                        stack =
                                        [
                                        ]
                                        static
                                        target =
                                        null
                                        deps =
                                        null
                                        constructor
                                        (
                                        )
                                        {
                                        this
                                        .
                                        deps =
                                        new
                                        Set
                                        (
                                        )
                                        }
                                        depend
                                        (
                                        )
                                        {
                                        if
                                        (
                                        Dep.
                                        target)
                                        {
                                        this
                                        .
                                        deps.
                                        add
                                        (
                                        Dep.
                                        target)
                                        }
                                        }
                                        notify
                                        (
                                        )
                                        {
                                        this
                                        .
                                        deps.
                                        forEach
                                        (
                                        w
                                        =>
                                        w.
                                        update
                                        (
                                        )
                                        )
                                        }
                                        static
                                        pushTarget
                                        (
                                        t
                                        )
                                        {
                                        if
                                        (
                                        this
                                        .
                                        target)
                                        {
                                        this
                                        .
                                        stack.
                                        push
                                        (
                                        this
                                        .
                                        target)
                                        }
                                        this
                                        .
                                        target =
                                        t
  }
                                        static
                                        popTarget
                                        (
                                        )
                                        {
                                        this
                                        .
                                        target =
                                        this
                                        .
                                        stack.
                                        pop
                                        (
                                        )
                                        }
                                        }
                                        // reactive
                                        function
                                        reactive
                                        (
                                        o
                                        )
                                        {
                                        if
                                        (
                                        o &&
                                        typeof
                                        o ===
                                        'object'
                                        )
                                        {
                                        Object.
                                        keys
                                        (
                                        o)
                                        .
                                        forEach
                                        (
                                        k
                                        =>
                                        {
                                        defineReactive
                                        (
                                        o,
                                        k,
                                        o[
                                        k]
                                        )
                                        }
                                        )
                                        }
                                        return
                                        o
}
                                        function
                                        defineReactive
                                        (

                                            obj,
                                            k,
                                            val

                                        )
                                        {
                                        let
                                        dep =
                                        new
                                        Dep
                                        (
                                        )
                                        Object.
                                        defineProperty
                                        (
                                        obj,
                                        k,
                                        {
                                        get
                                        (
                                        )
                                        {
                                        dep.
                                        depend
                                        (
                                        )
                                        return
                                        val
    }
                                        ,
                                        set
                                        (
                                        newVal)
                                        {
                                        val =
                                        newVal
      dep.
                                        notify
                                        (
                                        )
                                        }
                                        }
                                        )
                                        if
                                        (
                                        val &&
                                        typeof
                                        val ===
                                        'object'
                                        )
                                        {
                                        reactive
                                        (
                                        val)
                                        }
                                        }
                                        // watcher
                                        class
                                        Watcher
                                        {
                                        constructor
                                        (
                                        effect
                                        )
                                        {
                                        this
                                        .
                                        effect =
                                        effect
    this
                                        .
                                        update
                                        (
                                        )
                                        }
                                        update
                                        (
                                        )
                                        {
                                        Dep.
                                        pushTarget
                                        (
                                        this
                                        )
                                        this
                                        .
                                        value =
                                        this
                                        .
                                        effect
                                        (
                                        )
                                        Dep.
                                        popTarget
                                        (
                                        )
                                        return
                                        this
                                        .
                                        value
  }
                                        }
                                        // 测试代码
                                        const
                                        data =
                                        reactive
                                        (
                                        {
                                        msg
                                        :
                                        'aaa'
                                        }
                                        )
                                        new
                                        Watcher
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        '===>effect'
                                        ,
                                        data.
                                        msg)
                                        ;
                                        }
                                        )
                                        setTimeout
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        data.
                                        msg =
                                        'hello'
                                        }
                                        ,
                                        1000
                                        )


```
:::

### [\#](#_7-实现模板字符串解析功能){.header-anchor} 7 实现模板字符串解析功能 {#_7-实现模板字符串解析功能}

::: {.language-js .extra-class}
``` language-js

                                        let
                                        template =
                                        '我是{{name}}，年龄{{age}}，性别{{sex}}'
                                        ;
                                        let
                                        data =
                                        {
                                        name
                                        :
                                        '姓名'
                                        ,
                                        age
                                        :
                                        18
                                        }
                                        render
                                        (
                                        template,
                                        data)
                                        ;
                                        // 我是姓名，年龄18，性别undefined


```
:::

::: {.language-js .extra-class}
``` language-js

                                        function
                                        render
                                        (

                                            template,
                                            data

                                        )
                                        {
                                        const
                                        reg =

                                            /
                                            \{\{(\w+)\}\}
                                            /

                                        ;
                                        // 模板字符串正则
                                        if
                                        (
                                        reg.
                                        test
                                        (
                                        template)
                                        )
                                        {
                                        // 判断模板里是否有模板字符串
                                        const
                                        name =
                                        reg.
                                        exec
                                        (
                                        template)
                                        [
                                        1
                                        ]
                                        ;
                                        // 查找当前模板里第一个模板字符串的字段
                                        template =
                                        template.
                                        replace
                                        (
                                        reg,
                                        data[
                                        name]
                                        )
                                        ;
                                        // 将第一个模板字符串渲染
                                        return
                                        render
                                        (
                                        template,
                                        data)
                                        ;
                                        // 递归的渲染并返回渲染后的结构
                                        }
                                        return
                                        template;
                                        // 如果模板没有模板字符串直接返回
                                        }


```
:::

### [\#](#_8-实现一下hash路由){.header-anchor} 8 实现一下hash路由 {#_8-实现一下hash路由}

基础的`html` 代码：

::: {.language-html .extra-class}
``` language-html



                                                <
                                                html

                                            >



                                                <
                                                style

                                            >



                                                html, body
                                                {
                                                margin
                                                :
                                                0;
                                                height
                                                :
                                                100%;
                                                }
                                                ul
                                                {
                                                list-style
                                                :
                                                none;
                                                margin
                                                :
                                                0;
                                                padding
                                                :
                                                0;
                                                display
                                                :
                                                flex;
                                                justify-content
                                                :
                                                center;
                                                }
                                                .box
                                                {
                                                width
                                                :
                                                100%;
                                                height
                                                :
                                                100%;
                                                background-color
                                                :
                                                red;
                                                }




                                                </
                                                style

                                            >



                                                <
                                                body

                                            >



                                                <
                                                ul

                                            >



                                                <
                                                li

                                            >



                                                <
                                                a

                                            href

                                                =
                                                "
                                                #red"

                                            >

                                        红色


                                                </
                                                a

                                            >



                                                </
                                                li

                                            >



                                                <
                                                li

                                            >



                                                <
                                                a

                                            href

                                                =
                                                "
                                                #green"

                                            >

                                        绿色


                                                </
                                                a

                                            >



                                                </
                                                li

                                            >



                                                <
                                                li

                                            >



                                                <
                                                a

                                            href

                                                =
                                                "
                                                #purple"

                                            >

                                        紫色


                                                </
                                                a

                                            >



                                                </
                                                li

                                            >



                                                </
                                                ul

                                            >



                                                </
                                                body

                                            >



                                                </
                                                html

                                            >



```
:::

简单实现：

::: {.language-html .extra-class}
``` language-html



                                                <
                                                script

                                            >



                                                const
                                                box =
                                                document.
                                                getElementsByClassName
                                                (
                                                'box'
                                                )
                                                [
                                                0
                                                ]
                                                ;
                                                const
                                                hash =
                                                location.
                                                hash
  window.
                                                onhashchange
                                                =
                                                function
                                                (
                                                e
                                                )
                                                {
                                                const
                                                color =
                                                hash.
                                                slice
                                                (
                                                1
                                                )
                                                box.
                                                style.
                                                background =
                                                color
  }




                                                </
                                                script

                                            >



```
:::

封装成一个class:

::: {.language-html .extra-class}
``` language-html



                                                <
                                                script

                                            >



                                                const
                                                box =
                                                document.
                                                getElementsByClassName
                                                (
                                                'box'
                                                )
                                                [
                                                0
                                                ]
                                                ;
                                                const
                                                hash =
                                                location.
                                                hash
  class
                                                HashRouter
                                                {
                                                constructor
                                                (

                                                    hashStr,
                                                    cb

                                                )
                                                {
                                                this
                                                .
                                                hashStr =
                                                hashStr
      this
                                                .
                                                cb =
                                                cb
      this
                                                .
                                                watchHash
                                                (
                                                )
                                                this
                                                .
                                                watch =
                                                this
                                                .
                                                watchHash
                                                .
                                                bind
                                                (
                                                this
                                                )
                                                window.
                                                addEventListener
                                                (
                                                'hashchange'
                                                ,
                                                this
                                                .
                                                watch)
                                                }
                                                watchHash
                                                (
                                                )
                                                {
                                                let
                                                hash =
                                                window.
                                                location.
                                                hash.
                                                slice
                                                (
                                                1
                                                )
                                                this
                                                .
                                                hashStr =
                                                hash
      this
                                                .
                                                cb
                                                (
                                                hash)
                                                }
                                                }
                                                new
                                                HashRouter
                                                (
                                                'red'
                                                ,
                                                (
                                                color
                                                )
                                                =>
                                                {
                                                box.
                                                style.
                                                background =
                                                color
  }
                                                )




                                                </
                                                script

                                            >



```
:::

### [\#](#_9-实现redux中间件){.header-anchor} 9 实现redux中间件 {#_9-实现redux中间件}

**简单实现**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        createStore
                                        (
                                        reducer
                                        )
                                        {
                                        let
                                        currentState
  let
                                        listeners =
                                        [
                                        ]
                                        function
                                        getState
                                        (
                                        )
                                        {
                                        return
                                        currentState
  }
                                        function
                                        dispatch
                                        (
                                        action
                                        )
                                        {
                                        currentState =
                                        reducer
                                        (
                                        currentState,
                                        action)
                                        listeners.
                                        map
                                        (
                                        listener
                                        =>
                                        {
                                        listener
                                        (
                                        )
                                        }
                                        )
                                        return
                                        action
  }
                                        function
                                        subscribe
                                        (
                                        cb
                                        )
                                        {
                                        listeners.
                                        push
                                        (
                                        cb)
                                        return
                                        (
                                        )
                                        =>
                                        {
                                        }
                                        }
                                        dispatch
                                        (
                                        {
                                        type
                                        :
                                        'ZZZZZZZZZZ'
                                        }
                                        )
                                        return
                                        {
                                        getState,
                                        dispatch,
                                        subscribe
  }
                                        }
                                        // 应用实例如下：
                                        function
                                        reducer
                                        (

                                            state =
                                            0
                                            ,
                                            action

                                        )
                                        {
                                        switch
                                        (
                                        action.
                                        type)
                                        {
                                        case
                                        'ADD'
                                        :
                                        return
                                        state +
                                        1
                                        case
                                        'MINUS'
                                        :
                                        return
                                        state -
                                        1
                                        default
                                        :
                                        return
                                        state
  }
                                        }
                                        const
                                        store =
                                        createStore
                                        (
                                        reducer)
                                        console.
                                        log
                                        (
                                        store)
                                        ;
                                        store.
                                        subscribe
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        'change'
                                        )
                                        ;
                                        }
                                        )
                                        console.
                                        log
                                        (
                                        store.
                                        getState
                                        (
                                        )
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        store.
                                        dispatch
                                        (
                                        {
                                        type
                                        :
                                        'ADD'
                                        }
                                        )
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        store.
                                        getState
                                        (
                                        )
                                        )
                                        ;


```
:::

**2. 迷你版**

::: {.language-js .extra-class}
``` language-js

                                        export
                                        const
                                        createStore
                                        =
                                        (

                                            reducer,
                                            enhancer

                                        )
                                        =>
                                        {
                                        if
                                        (
                                        enhancer)
                                        {
                                        return
                                        enhancer
                                        (
                                        createStore)
                                        (
                                        reducer)
                                        }
                                        let
                                        currentState =
                                        {
                                        }
                                        let
                                        currentListeners =
                                        [
                                        ]
                                        const
                                        getState
                                        =
                                        (
                                        )
                                        =>
                                        currentState
    const
                                        subscribe
                                        =
                                        (
                                        listener
                                        )
                                        =>
                                        {
                                        currentListeners.
                                        push
                                        (
                                        listener)
                                        }
                                        const
                                        dispatch
                                        =
                                        action
                                        =>
                                        {
                                        currentState =
                                        reducer
                                        (
                                        currentState,
                                        action)
                                        currentListeners.
                                        forEach
                                        (
                                        v
                                        =>
                                        v
                                        (
                                        )
                                        )
                                        return
                                        action
    }
                                        dispatch
                                        (
                                        {
                                        type
                                        :
                                        '@@INIT'
                                        }
                                        )
                                        return
                                        {
                                        getState,
                                        subscribe,
                                        dispatch}
                                        }
                                        //中间件实现
                                        export
                                        applyMiddleWare
                                        (

                                            ...
                                            middlewares

                                        )
                                        {
                                        return
                                        createStore
                                        =>
                                        ...
                                        args
                                        =>
                                        {
                                        const
                                        store =
                                        createStore
                                        (
                                        ...
                                        args)
                                        let
                                        dispatch =
                                        store.
                                        dispatch

        const
                                        midApi =
                                        {
                                        getState
                                        :
                                        store.
                                        getState,
                                        dispatch
                                        :
                                        ...
                                        args
                                        =>
                                        dispatch
                                        (
                                        ...
                                        args)
                                        }
                                        const
                                        middlewaresChain =
                                        middlewares.
                                        map
                                        (
                                        middleware
                                        =>
                                        middleware
                                        (
                                        midApi)
                                        )
                                        dispatch =
                                        compose
                                        (
                                        ...
                                        middlewaresChain)
                                        (
                                        store.
                                        dispatch)
                                        return
                                        {
                                        ...
                                        store,
                                        dispatch
        }
                                        }
                                        // fn1(fn2(fn3())) 把函数嵌套依次调用
                                        export
                                        function
                                        compose
                                        (

                                            ...
                                            funcs

                                        )
                                        {
                                        if
                                        (
                                        funcs.
                                        length===
                                        0
                                        )
                                        {
                                        return
                                        arg
                                        =>
                                        arg
    }
                                        if
                                        (
                                        funs.
                                        length===
                                        1
                                        )
                                        {
                                        return
                                        funs[
                                        0
                                        ]
                                        }
                                        return
                                        funcs.
                                        reduce
                                        (
                                        (

                                            ret,
                                            item

                                        )
                                        =>
                                        (

                                            ...
                                            args

                                        )
                                        =>
                                        ret
                                        (
                                        item
                                        (
                                        ...
                                        args)
                                        )
                                        )
                                        }
                                        //bindActionCreator实现
                                        function
                                        bindActionCreator
                                        (

                                            creator,
                                            dispatch

                                        )
                                        {
                                        return
                                        ...
                                        args
                                        =>
                                        dispatch
                                        (
                                        creator
                                        (
                                        ...
                                        args)
                                        )
                                        }
                                        function
                                        bindActionCreators
                                        (

                                            creators,
                                            didpatch

                                        )
                                        {
                                        //let bound = {}
                                        //Object.keys(creators).forEach(v=>{
                                        //     let creator = creator[v]
                                        //   bound[v] = bindActionCreator(creator,dispatch)
                                        //})
                                        //return bound
                                        return
                                        Object.
                                        keys
                                        (
                                        creators)
                                        .
                                        reduce
                                        (
                                        (

                                            ret,
                                            item

                                        )
                                        =>
                                        {
                                        ret[
                                        item]
                                        =
                                        bindActionCreator
                                        (
                                        creators[
                                        item]
                                        ,
                                        dispatch)
                                        return
                                        ret
    }
                                        ,
                                        {
                                        }
                                        )
                                        }


```
:::

### [\#](#_10-实现redux-thunk){.header-anchor} 10 实现redux-thunk {#_10-实现redux-thunk}

> `redux-thunk` 可以利用 `redux` 中间件让 `redux` 支持异步的 `action`

::: {.language-js .extra-class}
``` language-js

                                        // 如果 action 是个函数，就调用这个函数
                                        // 如果 action 不是函数，就传给下一个中间件
                                        // 发现 action 是函数就调用
                                        const
                                        thunk
                                        =
                                        (

                                            {
                                            dispatch,
                                            getState }

                                        )
                                        =>
                                        (
                                        next
                                        )
                                        =>
                                        (
                                        action
                                        )
                                        =>
                                        {
                                        if
                                        (
                                        typeof
                                        action ===
                                        'function'
                                        )
                                        {
                                        return
                                        action
                                        (
                                        dispatch,
                                        getState)
                                        ;
                                        }
                                        return
                                        next
                                        (
                                        action)
                                        ;
                                        }
                                        ;
                                        export
                                        default
                                        thunk



```
:::


## [\#](#_32-字符串相关){.header-anchor} 32 字符串相关 {#_32-字符串相关}

### [\#](#_1-查找字符串中出现最多的字符和个数){.header-anchor} 1 查找字符串中出现最多的字符和个数 {#_1-查找字符串中出现最多的字符和个数}

> 例: abbcccddddd -\>字符最多的是d，出现了5次

::: {.language-js .extra-class}
``` language-js

                                        let
                                        str =
                                        "abcabcabcbbccccc "
                                        ;
                                        let
                                        num =
                                        0
                                        ;
                                        let
                                        char =
                                        ''
                                        ;
                                        // 使其按照一定的次序排列
                                        str =
                                        str.
                                        split
                                        (
                                        ''
                                        )
                                        .
                                        sort
                                        (
                                        )
                                        .
                                        join
                                        (
                                        ''
                                        )
                                        ;
                                        // "aaabbbbbcccccccc "
                                        // 定义正则表达式
                                        let
                                        re =

                                            /
                                            (\w)\1+
                                            /
                                            g

                                        ;
                                        str.
                                        replace
                                        (
                                        re,
                                        (

                                            $0,
                                            $1

                                        )
                                        =>
                                        {
                                        if
                                        (
                                        num <
                                        $0.
                                        length)
                                        {
                                        num =
                                        $0.
                                        length;
                                        char =
                                        $1;
                                        }
                                        }
                                        )
                                        ;
                                        console.
                                        log
                                        (

                                            `
                                            字符最多的是

                                                ${
                                                char}

                                            ，出现了

                                                ${
                                                num}

                                            次
                                            `

                                        )
                                        ;


```
:::

### [\#](#_2-字符串查找){.header-anchor} 2 字符串查找 {#_2-字符串查找}

> 请使用最基本的遍历来实现判断字符串 a 是否被包含在字符串 b
> 中，并返回第一次出现的位置（找不到返回 -1）。

::: {.language-js .extra-class}
``` language-js

                                        a=
                                        '34'
                                        ;
                                        b=
                                        '1234567'
                                        ;
                                        // 返回 2
                                        a=
                                        '35'
                                        ;
                                        b=
                                        '1234567'
                                        ;
                                        // 返回 -1
                                        a=
                                        '355'
                                        ;
                                        b=
                                        '12354355'
                                        ;
                                        // 返回 5
                                        isContain
                                        (
                                        a,
                                        b)
                                        ;


```
:::

::: {.language-js .extra-class}
``` language-js

                                        function
                                        isContain
                                        (

                                            a,
                                            b

                                        )
                                        {
                                        for
                                        (
                                        let
                                        i in
                                        b)
                                        {
                                        if
                                        (
                                        a[
                                        0
                                        ]
                                        ===
                                        b[
                                        i]
                                        )
                                        {
                                        let
                                        tmp =
                                        true
                                        ;
                                        for
                                        (
                                        let
                                        j in
                                        a)
                                        {
                                        if
                                        (
                                        a[
                                        j]
                                        !==
                                        b[
                                        ~
                                        ~
                                        i +
                                        ~
                                        ~
                                        j]
                                        )
                                        {
                                        tmp =
                                        false
                                        ;
                                        }
                                        }
                                        if
                                        (
                                        tmp)
                                        {
                                        return
                                        i;
                                        }
                                        }
                                        }
                                        return
                                        -
                                        1
                                        ;
                                        }


```
:::

### [\#](#_3-字符串最长的不重复子串){.header-anchor} 3 字符串最长的不重复子串 {#_3-字符串最长的不重复子串}

题目描述

::: {.language- .extra-class}
``` language-text
                                    给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度。


示例 1:

输入: s = "abcabcbb "输出: 3
解释: 因为无重复字符的最长子串是 "abc "，所以其长度为 3。

示例 2:

输入: s = "bbbbb "输出: 1
解释: 因为无重复字符的最长子串是 "b "，所以其长度为 1。

示例 3:

输入: s = "pwwkew "输出: 3
解释: 因为无重复字符的最长子串是 "wke "，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke "是一个子序列，不是子串。

示例 4:

输入: s = ""输出: 0


```
:::

答案

::: {.language-js .extra-class}
``` language-js

                                        const
                                        lengthOfLongestSubstring
                                        =
                                        function
                                        (
                                        s
                                        )
                                        {
                                        if
                                        (
                                        s.
                                        length ===
                                        0
                                        )
                                        {
                                        return
                                        0
                                        ;
                                        }
                                        let
                                        left =
                                        0
                                        ;
                                        let
                                        right =
                                        1
                                        ;
                                        let
                                        max =
                                        0
                                        ;
                                        while
                                        (
                                        right <=
                                        s.
                                        length)
                                        {
                                        let
                                        lr =
                                        s.
                                        slice
                                        (
                                        left,
                                        right)
                                        ;
                                        const
                                        index =
                                        lr.
                                        indexOf
                                        (
                                        s[
                                        right]
                                        )
                                        ;
                                        if
                                        (
                                        index >
                                        -
                                        1
                                        )
                                        {
                                        left =
                                        index +
                                        left +
                                        1
                                        ;
                                        }
                                        else
                                        {
                                        lr =
                                        s.
                                        slice
                                        (
                                        left,
                                        right +
                                        1
                                        )
                                        ;
                                        max =
                                        Math.
                                        max
                                        (
                                        max,
                                        lr.
                                        length)
                                        ;
                                        }
                                        right++
                                        ;
                                        }
                                        return
                                        max;
                                        }
                                        ;


```
:::

## [\#](#_33-实现工具函数){.header-anchor} 33 实现工具函数 {#_33-实现工具函数}

### [\#](#_1-对象扁平化){.header-anchor} 1 对象扁平化 {#_1-对象扁平化}

::: {.language-js .extra-class}
``` language-js

                                        function
                                        objectFlat
                                        (

                                            obj =
                                            {
                                            }

                                        )
                                        {
                                        const
                                        res =
                                        {
                                        }
                                        function
                                        flat
                                        (
                                        item,
                                        preKey =
                                        ''
                                        )
                                        {
                                        Object.
                                        entries
                                        (
                                        item)
                                        .
                                        forEach
                                        (
                                        (

                                            [
                                            key,
                                            val]

                                        )
                                        =>
                                        {
                                        const
                                        newKey =
                                        preKey ?

                                            `

                                                ${
                                                preKey}

                                            .

                                                ${
                                                key}

                                            `

                                        :
                                        key
      if
                                        (
                                        val &&
                                        typeof
                                        val ===
                                        'object'
                                        )
                                        {
                                        flat
                                        (
                                        val,
                                        newKey)
                                        }
                                        else
                                        {
                                        res[
                                        newKey]
                                        =
                                        val
      }
                                        }
                                        )
                                        }
                                        flat
                                        (
                                        obj)
                                        return
                                        res
}
                                        // 测试
                                        const
                                        source =
                                        {
                                        a
                                        :
                                        {
                                        b
                                        :
                                        {
                                        c
                                        :
                                        1
                                        ,
                                        d
                                        :
                                        2
                                        }
                                        ,
                                        e
                                        :
                                        3
                                        }
                                        ,
                                        f
                                        :
                                        {
                                        g
                                        :
                                        2
                                        }
                                        }
                                        console.
                                        log
                                        (
                                        objectFlat
                                        (
                                        source)
                                        )
                                        ;


```
:::

### [\#](#_2-实现一个管理本地缓存过期的函数){.header-anchor} 2 实现一个管理本地缓存过期的函数 {#_2-实现一个管理本地缓存过期的函数}

> 封装一个可以设置过期时间的`localStorage` 存储函数

::: {.language-js .extra-class}
``` language-js

                                        class
                                        Storage
                                        {
                                        constructor
                                        (
                                        name
                                        )
                                        {
                                        this
                                        .
                                        name =
                                        'storage'
                                        ;
                                        }
                                        //设置缓存
                                        setItem
                                        (
                                        params
                                        )
                                        {
                                        let
                                        obj =
                                        {
                                        name
                                        :
                                        ''
                                        ,
                                        // 存入数据  属性
                                        value
                                        :
                                        ''
                                        ,
                                        // 属性值
                                        expires
                                        :
                                        ""
                                        ,
                                        // 过期时间
                                        startTime
                                        :
                                        new
                                        Date
                                        (
                                        )
                                        .
                                        getTime
                                        (
                                        )
                                        //记录何时将值存入缓存，毫秒级
                                        }
                                        let
                                        options =
                                        {
                                        }
                                        ;
                                        //将obj和传进来的params合并
                                        Object.
                                        assign
                                        (
                                        options,
                                        obj,
                                        params)
                                        ;
                                        if
                                        (
                                        options.
                                        expires)
                                        {
                                        //如果options.expires设置了的话
                                        //以options.name为key，options为值放进去
                                        localStorage.
                                        setItem
                                        (
                                        options.
                                        name,
                                        JSON
                                        .
                                        stringify
                                        (
                                        options)
                                        )
                                        ;
                                        }
                                        else
                                        {
                                        //如果options.expires没有设置，就判断一下value的类型
                                        let
                                        type =
                                        Object
                                        .
                                        prototype.
                                        toString
                                        .
                                        call
                                        (
                                        options.
                                        value)
                                        ;
                                        //如果value是对象或者数组对象的类型，就先用JSON.stringify转一下，再存进去
                                        if
                                        (
                                        Object
                                        .
                                        prototype.
                                        toString
                                        .
                                        call
                                        (
                                        options.
                                        value)
                                        ==
                                        '[object Object]'
                                        )
                                        {
                                        options.
                                        value =
                                        JSON
                                        .
                                        stringify
                                        (
                                        options.
                                        value)
                                        ;
                                        }
                                        if
                                        (
                                        Object
                                        .
                                        prototype.
                                        toString
                                        .
                                        call
                                        (
                                        options.
                                        value)
                                        ==
                                        '[object Array]'
                                        )
                                        {
                                        options.
                                        value =
                                        JSON
                                        .
                                        stringify
                                        (
                                        options.
                                        value)
                                        ;
                                        }
                                        localStorage.
                                        setItem
                                        (
                                        options.
                                        name,
                                        options.
                                        value)
                                        ;
                                        }
                                        }
                                        //拿到缓存
                                        getItem
                                        (
                                        name
                                        )
                                        {
                                        let
                                        item =
                                        localStorage.
                                        getItem
                                        (
                                        name)
                                        ;
                                        //先将拿到的试着进行json转为对象的形式
                                        try
                                        {
                                        item =
                                        JSON
                                        .
                                        parse
                                        (
                                        item)
                                        ;
                                        }
                                        catch
                                        (
                                        error)
                                        {
                                        //如果不行就不是json的字符串，就直接返回
                                        item =
                                        item;
                                        }
                                        //如果有startTime的值，说明设置了失效时间
                                        if
                                        (
                                        item.
                                        startTime)
                                        {
                                        let
                                        date =
                                        new
                                        Date
                                        (
                                        )
                                        .
                                        getTime
                                        (
                                        )
                                        ;
                                        //何时将值取出减去刚存入的时间，与item.expires比较，如果大于就是过期了，如果小于或等于就还没过期
                                        if
                                        (
                                        date -
                                        item.
                                        startTime >
                                        item.
                                        expires)
                                        {
                                        //缓存过期，清除缓存，返回false
                                        localStorage.
                                        removeItem
                                        (
                                        name)
                                        ;
                                        return
                                        false
                                        ;
                                        }
                                        else
                                        {
                                        //缓存未过期，返回值
                                        return
                                        item.
                                        value;
                                        }
                                        }
                                        else
                                        {
                                        //如果没有设置失效时间，直接返回值
                                        return
                                        item;
                                        }
                                        }
                                        //移出缓存
                                        removeItem
                                        (
                                        name
                                        )
                                        {
                                        localStorage.
                                        removeItem
                                        (
                                        name)
                                        ;
                                        }
                                        //移出全部缓存
                                        clear
                                        (
                                        )
                                        {
                                        localStorage.
                                        clear
                                        (
                                        )
                                        ;
                                        }
                                        }


```
:::

**用法**

::: {.language-js .extra-class}
``` language-js

                                        let
                                        storage =
                                        new
                                        Storage
                                        (
                                        )
                                        ;
                                        storage.
                                        setItem
                                        (
                                        {
                                        name
                                        :
                                        "name "
                                        ,
                                        value
                                        :
                                        "ppp "
                                        }
                                        )


```
:::

下面我把值取出来

::: {.language-js .extra-class}
``` language-js

                                        let
                                        value =
                                        storage.
                                        getItem
                                        (
                                        'name'
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        '我是value'
                                        ,
                                        value)
                                        ;


```
:::

> 设置5秒过期

::: {.language-js .extra-class}
``` language-js

                                        let
                                        storage =
                                        new
                                        Storage
                                        (
                                        )
                                        ;
                                        storage.
                                        setItem
                                        (
                                        {
                                        name
                                        :
                                        "name "
                                        ,
                                        value
                                        :
                                        "ppp "
                                        ,
                                        expires
                                        :
                                        5000
                                        }
                                        )


```
:::

::: {.language-js .extra-class}
``` language-js

                                        // 过期后再取出来会变为 false
                                        let
                                        value =
                                        storage.
                                        getItem
                                        (
                                        'name'
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        '我是value'
                                        ,
                                        value)
                                        ;


```
:::

### [\#](#_3-实现lodash的chunk方法-数组按指定长度拆分){.header-anchor} 3 实现lodash的chunk方法\--数组按指定长度拆分 {#_3-实现lodash的chunk方法-数组按指定长度拆分}

**题目**

::: {.language-js .extra-class}
``` language-js

                                        /**
 * @param input
 * @param size
 * @returns {Array}
 */
                                        _.
                                        chunk
                                        (
                                        [
                                        'a'
                                        ,
                                        'b'
                                        ,
                                        'c'
                                        ,
                                        'd'
                                        ]
                                        ,
                                        2
                                        )
                                        // =>[['a', 'b'], ['c', 'd']]
                                        _.
                                        chunk
                                        (
                                        [
                                        'a'
                                        ,
                                        'b'
                                        ,
                                        'c'
                                        ,
                                        'd'
                                        ]
                                        ,
                                        3
                                        )
                                        // =>[['a', 'b', 'c'], ['d']]
                                        _.
                                        chunk
                                        (
                                        [
                                        'a'
                                        ,
                                        'b'
                                        ,
                                        'c'
                                        ,
                                        'd'
                                        ]
                                        ,
                                        5
                                        )
                                        // =>[['a', 'b', 'c', 'd']]
                                        _.
                                        chunk
                                        (
                                        [
                                        'a'
                                        ,
                                        'b'
                                        ,
                                        'c'
                                        ,
                                        'd'
                                        ]
                                        ,
                                        0
                                        )
                                        // =>[]


```
:::

**实现**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        chunk
                                        (

                                            arr,
                                            length

                                        )
                                        {
                                        let
                                        newArr =
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        arr.
                                        length;
                                        i +=
                                        length)
                                        {
                                        newArr.
                                        push
                                        (
                                        arr.
                                        slice
                                        (
                                        i,
                                        i +
                                        length)
                                        )
                                        ;
                                        }
                                        return
                                        newArr;
                                        }


```
:::

### [\#](#_4-手写深度比较isequal){.header-anchor} 4 手写深度比较isEqual {#_4-手写深度比较isequal}

> 思路：深度比较两个对象，就是要深度比较对象的每一个元素。=\>递归

-   递归退出条件：
    -   被比较的是两个值类型变量，直接用"==="判断
    -   被比较的两个变量之一为`null` ，直接判断另一个元素是否也为`null`
-   提前结束递推：
    -   两个变量`keys` 数量不同
    -   传入的两个参数是同一个变量
-   递推工作：深度比较每一个`key`

::: {.language-js .extra-class}
``` language-js

                                        function
                                        isEqual
                                        (

                                            obj1,
                                            obj2

                                        )
                                        {
                                        //其中一个为值类型或null
                                        if
                                        (
                                        !
                                        isObject
                                        (
                                        obj1)
                                        ||
                                        !
                                        isObject
                                        (
                                        obj2)
                                        )
                                        {
                                        return
                                        obj1 ===
                                        obj2;
                                        }
                                        //判断是否两个参数是同一个变量
                                        if
                                        (
                                        obj1 ===
                                        obj2)
                                        {
                                        return
                                        true
                                        ;
                                        }
                                        //判断keys数是否相等
                                        const
                                        obj1Keys =
                                        Object.
                                        keys
                                        (
                                        obj1)
                                        ;
                                        const
                                        obj2Keys =
                                        Object.
                                        keys
                                        (
                                        obj2)
                                        ;
                                        if
                                        (
                                        obj1Keys.
                                        length !==
                                        obj2Keys.
                                        length)
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        //深度比较每一个key
                                        for
                                        (
                                        let
                                        key in
                                        obj1)
                                        {
                                        if
                                        (
                                        !
                                        isEqual
                                        (
                                        obj1[
                                        key]
                                        ,
                                        obj2[
                                        key]
                                        )
                                        )
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        }
                                        return
                                        true
                                        ;
                                        }


```
:::

### [\#](#_5-实现一个json-stringify){.header-anchor} 5 实现一个JSON.stringify {#_5-实现一个json-stringify}

::: {.language-js .extra-class}
``` language-js

                                        JSON
                                        .
                                        stringify
                                        (
                                        value[
                                        ,
                                        replacer [
                                        ,
                                        space]
                                        ]
                                        )
                                        ：



```
:::

-   `Boolean | Number| String` 类型会自动转换成对应的原始值。
-   `undefined` 、任意函数以及`symbol`
    ，会被忽略（出现在非数组对象的属性值中时），或者被转换成 `null`
    （出现在数组中时）。
-   不可枚举的属性会被忽略如果一个对象的属性值通过某种间接的方式指回该对象本身，即循环引用，属性也会被忽略
-   如果一个对象的属性值通过某种间接的方式指回该对象本身，即循环引用，属性也会被忽略

::: {.language-js .extra-class}
``` language-js

                                        function
                                        jsonStringify
                                        (
                                        obj
                                        )
                                        {
                                        let
                                        type =
                                        typeof
                                        obj;
                                        if
                                        (
                                        type !==
                                        "object "
                                        )
                                        {
                                        if
                                        (

                                            /
                                            string|undefined|function
                                            /

                                        .
                                        test
                                        (
                                        type)
                                        )
                                        {
                                        obj =
                                        '"'
                                        +
                                        obj +
                                        '"'
                                        ;
                                        }
                                        return
                                        String
                                        (
                                        obj)
                                        ;
                                        }
                                        else
                                        {
                                        let
                                        json =
                                        [
                                        ]
                                        let
                                        arr =
                                        Array.
                                        isArray
                                        (
                                        obj)
                                        for
                                        (
                                        let
                                        k in
                                        obj)
                                        {
                                        let
                                        v =
                                        obj[
                                        k]
                                        ;
                                        let
                                        type =
                                        typeof
                                        v;
                                        if
                                        (

                                            /
                                            string|undefined|function
                                            /

                                        .
                                        test
                                        (
                                        type)
                                        )
                                        {
                                        v =
                                        '"'
                                        +
                                        v +
                                        '"'
                                        ;
                                        }
                                        else
                                        if
                                        (
                                        type ===
                                        "object "
                                        )
                                        {
                                        v =
                                        jsonStringify
                                        (
                                        v)
                                        ;
                                        }
                                        json.
                                        push
                                        (
                                        (
                                        arr ?
                                        ""
                                        :
                                        '"'
                                        +
                                        k +
                                        '":'
                                        )
                                        +
                                        String
                                        (
                                        v)
                                        )
                                        ;
                                        }
                                        return
                                        (
                                        arr ?
                                        "["
                                        :
                                        "{"
                                        )
                                        +
                                        String
                                        (
                                        json)
                                        +
                                        (
                                        arr ?
                                        "]"
                                        :
                                        "}"
                                        )
                                        }
                                        }
                                        jsonStringify
                                        (
                                        {
                                        x
                                        :
                                        5
                                        }
                                        )
                                        // "{"x ":5}"
                                        jsonStringify
                                        (
                                        [
                                        1
                                        ,
                                        "false "
                                        ,
                                        false
                                        ]
                                        )
                                        // "[1,"false ",false]"
                                        jsonStringify
                                        (
                                        {
                                        b
                                        :
                                        undefined
                                        }
                                        )
                                        // "{"b ":"undefined "}"


```
:::

### [\#](#_6-实现一个json-parse){.header-anchor} 6 实现一个JSON.parse {#_6-实现一个json-parse}

::: {.language- .extra-class}
``` language-text
                                    JSON.parse(text[, reviver])


```
:::

> 用来解析JSON字符串，构造由字符串描述的JavaScript值或对象。提供可选的reviver函数用以在返回之前对所得到的对象执行变换(操作)

**第一种：直接调用 eval**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        jsonParse
                                        (
                                        opt
                                        )
                                        {
                                        return
                                        eval
                                        (
                                        '('
                                        +
                                        opt +
                                        ')'
                                        )
                                        ;
                                        }
                                        jsonParse
                                        (
                                        jsonStringify
                                        (
                                        {
                                        x
                                        :
                                        5
                                        }
                                        )
                                        )
                                        // Object { x: 5}
                                        jsonParse
                                        (
                                        jsonStringify
                                        (
                                        [
                                        1
                                        ,
                                        "false "
                                        ,
                                        false
                                        ]
                                        )
                                        )
                                        // [1, "false ", falsr]
                                        jsonParse
                                        (
                                        jsonStringify
                                        (
                                        {
                                        b
                                        :
                                        undefined
                                        }
                                        )
                                        )
                                        // Object { b: "undefined "}


```
:::

> 避免在不必要的情况下使用 `eval` ，`eval()`
> 是一个危险的函数，他执行的代码拥有着执行者的权利。如果你用`eval()`
> 运行的字符串代码被恶意方（不怀好意的人）操控修改，您最终可能会在您的网页/扩展程序的权限下，在用户计算机上运行恶意代码。它会执行JS代码，有XSS漏洞。

如果你只想记这个方法，就得对参数json做校验。

::: {.language-js .extra-class}
``` language-js

                                        var
                                        rx_one =

                                            /
                                            ^[\],:{}\s]*$
                                            /

                                        ;
                                        var
                                        rx_two =

                                            /
                                            \\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})
                                            /
                                            g

                                        ;
                                        var
                                        rx_three =

                                            /
                                            "[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?
                                            /
                                            g

                                        ;
                                        var
                                        rx_four =

                                            /
                                            (?:^|:|,)(?:\s*\[)+
                                            /
                                            g

                                        ;
                                        if
                                        (
                                        rx_one.
                                        test
                                        (
                                        json
            .
                                        replace
                                        (
                                        rx_two,
                                        "@"
                                        )
                                        .
                                        replace
                                        (
                                        rx_three,
                                        "]"
                                        )
                                        .
                                        replace
                                        (
                                        rx_four,
                                        ""
                                        )
                                        )
                                        )
                                        {
                                        var
                                        obj =
                                        eval
                                        (
                                        "("
                                        +
                                        json +
                                        ")"
                                        )
                                        ;
                                        }


```
:::

**第二种：Function**

> 核心：Function与eval有相同的字符串参数特性

::: {.language- .extra-class}
``` language-text
                                    var func = new Function(arg1, arg2, ..., functionBody);


```
:::

在转换JSON的实际应用中，只需要这么做

::: {.language-js .extra-class}
``` language-js

                                        var
                                        jsonStr =
                                        '{ "age ": 20, "name ": "jack "}'
                                        var
                                        json =
                                        (
                                        new
                                        Function
                                        (
                                        'return '
                                        +
                                        jsonStr)
                                        )
                                        (
                                        )
                                        ;


```
:::

> `eval` 与 `Function`
> 都有着动态编译js代码的作用，但是在实际的编程中并不推荐使用

### [\#](#_7-解析-url-params-为对象){.header-anchor} 7 解析 URL Params 为对象 {#_7-解析-url-params-为对象}

::: {.language-js .extra-class}
``` language-js

                                        let
                                        url =
                                        'http://www.domain.com/?user=anonymous &id=123 &id=456 &city=%E5%8C%97%E4%BA%AC &enabled'
                                        ;
                                        parseParam
                                        (
                                        url)
                                        /* 结果
{ user: 'anonymous',
  id: [ 123, 456 ], // 重复出现的 key 要组装成数组，能被转成数字的就转成数字类型
  city: '北京', // 中文需解码
  enabled: true, // 未指定值得 key 约定为 true
}
*/


```
:::

::: {.language-js .extra-class}
``` language-js

                                        function
                                        parseParam
                                        (
                                        url
                                        )
                                        {
                                        const
                                        paramsStr =

                                            /
                                            .+\?(.+)$
                                            /

                                        .
                                        exec
                                        (
                                        url)
                                        [
                                        1
                                        ]
                                        ;
                                        // 将 ? 后面的字符串取出来
                                        const
                                        paramsArr =
                                        paramsStr.
                                        split
                                        (
                                        '&'
                                        )
                                        ;
                                        // 将字符串以 &分割后存到数组中
                                        let
                                        paramsObj =
                                        {
                                        }
                                        ;
                                        // 将 params 存到对象中
                                        paramsArr.
                                        forEach
                                        (
                                        param
                                        =>
                                        {
                                        if
                                        (

                                            /
                                            =
                                            /

                                        .
                                        test
                                        (
                                        param)
                                        )
                                        {
                                        // 处理有 value 的参数
                                        let
                                        [
                                        key,
                                        val]
                                        =
                                        param.
                                        split
                                        (
                                        '='
                                        )
                                        ;
                                        // 分割 key 和 value
                                        val =
                                        decodeURIComponent
                                        (
                                        val)
                                        ;
                                        // 解码
                                        val =

                                            /
                                            ^\d+$
                                            /

                                        .
                                        test
                                        (
                                        val)
                                        ?
                                        parseFloat
                                        (
                                        val)
                                        :
                                        val;
                                        // 判断是否转为数字
                                        if
                                        (
                                        paramsObj.
                                        hasOwnProperty
                                        (
                                        key)
                                        )
                                        {
                                        // 如果对象有 key，则添加一个值
                                        paramsObj[
                                        key]
                                        =
                                        [
                                        ]
                                        .
                                        concat
                                        (
                                        paramsObj[
                                        key]
                                        ,
                                        val)
                                        ;
                                        }
                                        else
                                        {
                                        // 如果对象没有这个 key，创建 key 并设置值
                                        paramsObj[
                                        key]
                                        =
                                        val;
                                        }
                                        }
                                        else
                                        {
                                        // 处理没有 value 的参数
                                        paramsObj[
                                        param]
                                        =
                                        true
                                        ;
                                        }
                                        }
                                        )
                                        return
                                        paramsObj;
                                        }


```
:::

### [\#](#_8-转化为驼峰命名){.header-anchor} 8 转化为驼峰命名 {#_8-转化为驼峰命名}

::: {.language-js .extra-class}
``` language-js

                                        var
                                        s1 =
                                        "get-element-by-id "
                                        // 转化为 getElementById
                                        var
                                        f
                                        =
                                        function
                                        (
                                        s
                                        )
                                        {
                                        return
                                        s.
                                        replace
                                        (

                                            /
                                            -\w
                                            /
                                            g

                                        ,
                                        function
                                        (
                                        x
                                        )
                                        {
                                        return
                                        x.
                                        slice
                                        (
                                        1
                                        )
                                        .
                                        toUpperCase
                                        (
                                        )
                                        ;
                                        }
                                        )
                                        }


```
:::

### [\#](#_9-实现一个函数判断数据类型){.header-anchor} 9 实现一个函数判断数据类型 {#_9-实现一个函数判断数据类型}

::: {.language-js .extra-class}
``` language-js

                                        function
                                        getType
                                        (
                                        obj
                                        )
                                        {
                                        if
                                        (
                                        obj ===
                                        null
                                        )
                                        return
                                        String
                                        (
                                        obj)
                                        ;
                                        return
                                        typeof
                                        obj ===
                                        'object'
                                        ?
                                        Object
                                        .
                                        prototype.
                                        toString
                                        .
                                        call
                                        (
                                        obj)
                                        .
                                        replace
                                        (
                                        '[object '
                                        ,
                                        ''
                                        )
                                        .
                                        replace
                                        (
                                        ']'
                                        ,
                                        ''
                                        )
                                        .
                                        toLowerCase
                                        (
                                        )
                                        :
                                        typeof
                                        obj;
                                        }
                                        // 调用
                                        getType
                                        (
                                        null
                                        )
                                        ;
                                        // ->null
                                        getType
                                        (
                                        undefined
                                        )
                                        ;
                                        // ->undefined
                                        getType
                                        (
                                        {
                                        }
                                        )
                                        ;
                                        // ->object
                                        getType
                                        (
                                        [
                                        ]
                                        )
                                        ;
                                        // ->array
                                        getType
                                        (
                                        123
                                        )
                                        ;
                                        // ->number
                                        getType
                                        (
                                        true
                                        )
                                        ;
                                        // ->boolean
                                        getType
                                        (
                                        '123'
                                        )
                                        ;
                                        // ->string
                                        getType
                                        (

                                            /
                                            123
                                            /

                                        )
                                        ;
                                        // ->regexp
                                        getType
                                        (
                                        new
                                        Date
                                        (
                                        )
                                        )
                                        ;
                                        // ->date


```
:::

### [\#](#_10-对象数组列表转成树形结构-处理菜单){.header-anchor} 10 对象数组列表转成树形结构（处理菜单） {#_10-对象数组列表转成树形结构-处理菜单}

::: {.language- .extra-class}
``` language-text
                                    [
    {
        id: 1,
        text: '节点1',
        parentId: 0 //这里用0表示为顶级节点
    },
    {
        id: 2,
        text: '节点1_1',
        parentId: 1 //通过这个字段来确定子父级
    }
    ...
]

转成
[
    {
        id: 1,
        text: '节点1',
        parentId: 0,
        children: [
            {
                id:2,
                text: '节点1_1',
                parentId:1
            }
        ]
    }
]


```
:::

实现代码如下:

::: {.language-js .extra-class}
``` language-js

                                        function
                                        listToTree
                                        (
                                        data
                                        )
                                        {
                                        let
                                        temp =
                                        {
                                        }
                                        ;
                                        let
                                        treeData =
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        data.
                                        length;
                                        i++
                                        )
                                        {
                                        temp[
                                        data[
                                        i]
                                        .
                                        id]
                                        =
                                        data[
                                        i]
                                        ;
                                        }
                                        for
                                        (
                                        let
                                        i in
                                        temp)
                                        {
                                        if
                                        (
                                        +
                                        temp[
                                        i]
                                        .
                                        parentId !=
                                        0
                                        )
                                        {
                                        if
                                        (
                                        !
                                        temp[
                                        temp[
                                        i]
                                        .
                                        parentId]
                                        .
                                        children)
                                        {
                                        temp[
                                        temp[
                                        i]
                                        .
                                        parentId]
                                        .
                                        children =
                                        [
                                        ]
                                        ;
                                        }
                                        temp[
                                        temp[
                                        i]
                                        .
                                        parentId]
                                        .
                                        children.
                                        push
                                        (
                                        temp[
                                        i]
                                        )
                                        ;
                                        }
                                        else
                                        {
                                        treeData.
                                        push
                                        (
                                        temp[
                                        i]
                                        )
                                        ;
                                        }
                                        }
                                        return
                                        treeData;
                                        }


```
:::

### [\#](#_11-树形结构转成列表-处理菜单){.header-anchor} 11 树形结构转成列表（处理菜单） {#_11-树形结构转成列表-处理菜单}

::: {.language- .extra-class}
``` language-text
                                    [
    {
        id: 1,
        text: '节点1',
        parentId: 0,
        children: [
            {
                id:2,
                text: '节点1_1',
                parentId:1
            }
        ]
    }
]
转成
[
    {
        id: 1,
        text: '节点1',
        parentId: 0 //这里用0表示为顶级节点
    },
    {
        id: 2,
        text: '节点1_1',
        parentId: 1 //通过这个字段来确定子父级
    }
    ...
]


```
:::

实现代码如下:

::: {.language-js .extra-class}
``` language-js

                                        function
                                        treeToList
                                        (
                                        data
                                        )
                                        {
                                        let
                                        res =
                                        [
                                        ]
                                        ;
                                        const
                                        dfs
                                        =
                                        (
                                        tree
                                        )
                                        =>
                                        {
                                        tree.
                                        forEach
                                        (
                                        (
                                        item
                                        )
                                        =>
                                        {
                                        if
                                        (
                                        item.
                                        children)
                                        {
                                        dfs
                                        (
                                        item.
                                        children)
                                        ;
                                        delete
                                        item.
                                        children;
                                        }
                                        res.
                                        push
                                        (
                                        item)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        ;
                                        dfs
                                        (
                                        data)
                                        ;
                                        return
                                        res;
                                        }


```
:::

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

## [\#](#_36-综合){.header-anchor} 36 综合 {#_36-综合}

### [\#](#_1-实现一个-sleep-函数-比如-sleep-1000-意味着等待1000毫秒){.header-anchor} 1 实现一个 sleep 函数，比如 sleep(1000) 意味着等待1000毫秒 {#_1-实现一个-sleep-函数-比如-sleep-1000-意味着等待1000毫秒}

::: {.language-js .extra-class}
``` language-js

                                        // 使用 promise来实现 sleep
                                        const
                                        sleep
                                        =
                                        (
                                        time
                                        )
                                        =>
                                        {
                                        return
                                        new
                                        Promise
                                        (
                                        resolve
                                        =>
                                        setTimeout
                                        (
                                        resolve,
                                        time)
                                        )
                                        }
                                        sleep
                                        (
                                        1000
                                        )
                                        .
                                        then
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        // 这里写你的骚操作
                                        }
                                        )


```
:::

### [\#](#_2-给定两个数组-写一个方法来计算它们的交集){.header-anchor} 2 给定两个数组，写一个方法来计算它们的交集 {#_2-给定两个数组-写一个方法来计算它们的交集}

> 例如：给定 nums1 = \[1, 2, 2, 1\]，nums2 = \[2, 2\]，返回 \[2, 2\]。

::: {.language-js .extra-class}
``` language-js

                                        function
                                        union
                                        (

                                            arr1,
                                            arr2

                                        )
                                        {
                                        return
                                        arr1.
                                        filter
                                        (
                                        item
                                        =>
                                        {
                                        return
                                        arr2.
                                        indexOf
                                        (
                                        item)
                                        >
                                        -
                                        1
                                        ;
                                        }
                                        )
                                        }
                                        const
                                        a =
                                        [
                                        1
                                        ,
                                        2
                                        ,
                                        2
                                        ,
                                        1
                                        ]
                                        ;
                                        const
                                        b =
                                        [
                                        2
                                        ,
                                        3
                                        ,
                                        2
                                        ]
                                        ;
                                        console.
                                        log
                                        (
                                        union
                                        (
                                        a,
                                        b)
                                        )
                                        ;
                                        // [2, 2]


```
:::

### [\#](#_3-异步并发数限制){.header-anchor} 3 异步并发数限制 {#_3-异步并发数限制}

::: {.language-js .extra-class}
``` language-js

                                        /**
 * 关键点
 * 1. new promise 一经创建，立即执行
 * 2. 使用 Promise.resolve().then 可以把任务加到微任务队列，防止立即执行迭代方法
 * 3. 微任务处理过程中，产生的新的微任务，会在同一事件循环内，追加到微任务队列里
 * 4. 使用 race 在某个任务完成时，继续添加任务，保持任务按照最大并发数进行执行
 * 5. 任务完成后，需要从 doingTasks 中移出
 */
                                        function
                                        limit
                                        (

                                            count,
                                            array,
                                            iterateFunc

                                        )
                                        {
                                        const
                                        tasks =
                                        [
                                        ]
                                        const
                                        doingTasks =
                                        [
                                        ]
                                        let
                                        i =
                                        0
                                        const
                                        enqueue
                                        =
                                        (
                                        )
                                        =>
                                        {
                                        if
                                        (
                                        i ===
                                        array.
                                        length)
                                        {
                                        return
                                        Promise.
                                        resolve
                                        (
                                        )
                                        }
                                        const
                                        task =
                                        Promise.
                                        resolve
                                        (
                                        )
                                        .
                                        then
                                        (
                                        (
                                        )
                                        =>
                                        iterateFunc
                                        (
                                        array[
                                        i++
                                        ]
                                        )
                                        )
                                        tasks.
                                        push
                                        (
                                        task)
                                        const
                                        doing =
                                        task.
                                        then
                                        (
                                        (
                                        )
                                        =>
                                        doingTasks.
                                        splice
                                        (
                                        doingTasks.
                                        indexOf
                                        (
                                        doing)
                                        ,
                                        1
                                        )
                                        )
                                        doingTasks.
                                        push
                                        (
                                        doing)
                                        const
                                        res =
                                        doingTasks.
                                        length >=
                                        count ?
                                        Promise.
                                        race
                                        (
                                        doingTasks)
                                        :
                                        Promise.
                                        resolve
                                        (
                                        )
                                        return
                                        res.
                                        then
                                        (
                                        enqueue)
                                        }
                                        ;
                                        return
                                        enqueue
                                        (
                                        )
                                        .
                                        then
                                        (
                                        (
                                        )
                                        =>
                                        Promise.
                                        all
                                        (
                                        tasks)
                                        )
                                        }
                                        // test
                                        const
                                        timeout
                                        =
                                        i
                                        =>
                                        new
                                        Promise
                                        (
                                        resolve
                                        =>
                                        setTimeout
                                        (
                                        (
                                        )
                                        =>
                                        resolve
                                        (
                                        i)
                                        ,
                                        i)
                                        )
                                        limit
                                        (
                                        2
                                        ,
                                        [
                                        1000
                                        ,
                                        1000
                                        ,
                                        1000
                                        ,
                                        1000
                                        ]
                                        ,
                                        timeout)
                                        .
                                        then
                                        (
                                        (
                                        res
                                        )
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        res)
                                        }
                                        )


```
:::

### [\#](#_4-异步串行-异步并行){.header-anchor} 4 异步串行 \| 异步并行 {#_4-异步串行-异步并行}

::: {.language-js .extra-class}
``` language-js

                                        // 字节面试题，实现一个异步加法
                                        function
                                        asyncAdd
                                        (

                                            a,
                                            b,
                                            callback

                                        )
                                        {
                                        setTimeout
                                        (
                                        function
                                        (
                                        )
                                        {
                                        callback
                                        (
                                        null
                                        ,
                                        a +
                                        b)
                                        ;
                                        }
                                        ,
                                        500
                                        )
                                        ;
                                        }
                                        // 解决方案
                                        // 1. promisify
                                        const
                                        promiseAdd
                                        =
                                        (

                                            a,
                                            b

                                        )
                                        =>
                                        new
                                        Promise
                                        (
                                        (

                                            resolve,
                                            reject

                                        )
                                        =>
                                        {
                                        asyncAdd
                                        (
                                        a,
                                        b,
                                        (

                                            err,
                                            res

                                        )
                                        =>
                                        {
                                        if
                                        (
                                        err)
                                        {
                                        reject
                                        (
                                        err)
                                        }
                                        else
                                        {
                                        resolve
                                        (
                                        res)
                                        }
                                        }
                                        )
                                        }
                                        )
                                        // 2. 串行处理
                                        async
                                        function
                                        serialSum
                                        (

                                            ...
                                            args

                                        )
                                        {
                                        return
                                        args.
                                        reduce
                                        (
                                        (

                                            task,
                                            now

                                        )
                                        =>
                                        task.
                                        then
                                        (
                                        res
                                        =>
                                        promiseAdd
                                        (
                                        res,
                                        now)
                                        )
                                        ,
                                        Promise.
                                        resolve
                                        (
                                        0
                                        )
                                        )
                                        }
                                        // 3. 并行处理
                                        async
                                        function
                                        parallelSum
                                        (

                                            ...
                                            args

                                        )
                                        {
                                        if
                                        (
                                        args.
                                        length ===
                                        1
                                        )
                                        return
                                        args[
                                        0
                                        ]
                                        const
                                        tasks =
                                        [
                                        ]
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        args.
                                        length;
                                        i +=
                                        2
                                        )
                                        {
                                        tasks.
                                        push
                                        (
                                        promiseAdd
                                        (
                                        args[
                                        i]
                                        ,
                                        args[
                                        i +
                                        1
                                        ]
                                        ||
                                        0
                                        )
                                        )
                                        }
                                        const
                                        results =
                                        await
                                        Promise.
                                        all
                                        (
                                        tasks)
                                        return
                                        parallelSum
                                        (
                                        ...
                                        results)
                                        }
                                        // 测试
                                        (
                                        async
                                        (
                                        )
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        'Running...'
                                        )
                                        ;
                                        const
                                        res1 =
                                        await
                                        serialSum
                                        (
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ,
                                        4
                                        ,
                                        5
                                        ,
                                        8
                                        ,
                                        9
                                        ,
                                        10
                                        ,
                                        11
                                        ,
                                        12
                                        )
                                        console.
                                        log
                                        (
                                        res1)
                                        const
                                        res2 =
                                        await
                                        parallelSum
                                        (
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ,
                                        4
                                        ,
                                        5
                                        ,
                                        8
                                        ,
                                        9
                                        ,
                                        10
                                        ,
                                        11
                                        ,
                                        12
                                        )
                                        console.
                                        log
                                        (
                                        res2)
                                        console.
                                        log
                                        (
                                        'Done'
                                        )
                                        ;
                                        }
                                        )
                                        (
                                        )


```
:::

### [\#](#_5-实现有并行限制的-promise-调度器){.header-anchor} 5 实现有并行限制的 Promise 调度器 {#_5-实现有并行限制的-promise-调度器}

题目描述:JS 实现一个带并发限制的异步调度器 `Scheduler`
，保证同时运行的任务最多有两个

::: {.language- .extra-class}
``` language-text
                                    addTask(1000,"1 ");
 addTask(500,"2 ");
 addTask(300,"3 ");
 addTask(400,"4 ");
 的输出顺序是：2 3 1 4

 整个的完整执行流程：

一开始1、2两个任务开始执行
500ms时，2任务执行完毕，输出2，任务3开始执行
800ms时，3任务执行完毕，输出3，任务4开始执行
1000ms时，1任务执行完毕，输出1，此时只剩下4任务在执行
1200ms时，4任务执行完毕，输出4


```
:::

实现代码如下:

::: {.language-js .extra-class}
``` language-js

                                        class
                                        Scheduler
                                        {
                                        constructor
                                        (
                                        limit
                                        )
                                        {
                                        this
                                        .
                                        queue =
                                        [
                                        ]
                                        ;
                                        this
                                        .
                                        maxCount =
                                        limit;
                                        this
                                        .
                                        runCounts =
                                        0
                                        ;
                                        }
                                        add
                                        (

                                            time,
                                            order

                                        )
                                        {
                                        const
                                        promiseCreator
                                        =
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        new
                                        Promise
                                        (
                                        (

                                            resolve,
                                            reject

                                        )
                                        =>
                                        {
                                        setTimeout
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        order)
                                        ;
                                        resolve
                                        (
                                        )
                                        ;
                                        }
                                        ,
                                        time)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        ;
                                        this
                                        .
                                        queue.
                                        push
                                        (
                                        promiseCreator)
                                        ;
                                        }
                                        taskStart
                                        (
                                        )
                                        {
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        this
                                        .
                                        maxCount;
                                        i++
                                        )
                                        {
                                        this
                                        .
                                        request
                                        (
                                        )
                                        ;
                                        }
                                        }
                                        request
                                        (
                                        )
                                        {
                                        if
                                        (
                                        !
                                        this
                                        .
                                        queue ||
                                        !
                                        this
                                        .
                                        queue.
                                        length ||
                                        this
                                        .
                                        runCounts >=
                                        this
                                        .
                                        maxCount)
                                        {
                                        return
                                        ;
                                        }
                                        this
                                        .
                                        runCounts++
                                        ;
                                        this
                                        .
                                        queue
      .
                                        shift
                                        (
                                        )
                                        (
                                        )
                                        .
                                        then
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        this
                                        .
                                        runCounts--
                                        ;
                                        this
                                        .
                                        request
                                        (
                                        )
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        }
                                        const
                                        scheduler =
                                        new
                                        Scheduler
                                        (
                                        2
                                        )
                                        ;
                                        const
                                        addTask
                                        =
                                        (

                                            time,
                                            order

                                        )
                                        =>
                                        {
                                        scheduler.
                                        add
                                        (
                                        time,
                                        order)
                                        ;
                                        }
                                        ;
                                        addTask
                                        (
                                        1000
                                        ,
                                        "1 "
                                        )
                                        ;
                                        addTask
                                        (
                                        500
                                        ,
                                        "2 "
                                        )
                                        ;
                                        addTask
                                        (
                                        300
                                        ,
                                        "3 "
                                        )
                                        ;
                                        addTask
                                        (
                                        400
                                        ,
                                        "4 "
                                        )
                                        ;
                                        scheduler.
                                        taskStart
                                        (
                                        )
                                        ;


```
:::

### [\#](#_6-图片懒加载){.header-anchor} 6 图片懒加载 {#_6-图片懒加载}

::: {.language-js .extra-class}
``` language-js

                                        // <img src="default.png "data-src="https://xxxx/real.png ">
                                        function
                                        isVisible
                                        (
                                        el
                                        )
                                        {
                                        const
                                        position =
                                        el.
                                        getBoundingClientRect
                                        (
                                        )
                                        const
                                        windowHeight =
                                        document.
                                        documentElement.
                                        clientHeight
  // 顶部边缘可见
                                        const
                                        topVisible =
                                        position.
                                        top >
                                        0
                                        &&
                                        position.
                                        top <
                                        windowHeight;
                                        // 底部边缘可见
                                        const
                                        bottomVisible =
                                        position.
                                        bottom <
                                        windowHeight &&
                                        position.
                                        bottom >
                                        0
                                        ;
                                        return
                                        topVisible ||
                                        bottomVisible;
                                        }
                                        function
                                        imageLazyLoad
                                        (
                                        )
                                        {
                                        const
                                        images =
                                        document.
                                        querySelectorAll
                                        (
                                        'img'
                                        )
                                        for
                                        (
                                        let
                                        img of
                                        images)
                                        {
                                        const
                                        realSrc =
                                        img.
                                        dataset.
                                        src
    if
                                        (
                                        !
                                        realSrc)
                                        continue
                                        if
                                        (
                                        isVisible
                                        (
                                        img)
                                        )
                                        {
                                        img.
                                        src =
                                        realSrc
      img.
                                        dataset.
                                        src =
                                        ''
                                        }
                                        }
                                        }
                                        // 测试
                                        window.
                                        addEventListener
                                        (
                                        'load'
                                        ,
                                        imageLazyLoad)
                                        window.
                                        addEventListener
                                        (
                                        'scroll'
                                        ,
                                        imageLazyLoad)
                                        // or
                                        window.
                                        addEventListener
                                        (
                                        'scroll'
                                        ,
                                        throttle
                                        (
                                        imageLazyLoad,
                                        1000
                                        )
                                        )


```
:::

### [\#](#_7-实现-getvalue-setvalue-函数来获取path对应的值){.header-anchor} 7 实现 getValue/setValue 函数来获取path对应的值 {#_7-实现-getvalue-setvalue-函数来获取path对应的值}

::: {.language-js .extra-class}
``` language-js

                                        // 示例
                                        var
                                        object =
                                        {
                                        a
                                        :
                                        [
                                        {
                                        b
                                        :
                                        {
                                        c
                                        :
                                        3
                                        }
                                        }
                                        ]
                                        }
                                        ;
                                        // path: 'a[0].b.c'
                                        var
                                        array =
                                        [
                                        {
                                        a
                                        :
                                        {
                                        b
                                        :
                                        [
                                        1
                                        ]
                                        }
                                        }
                                        ]
                                        ;
                                        // path: '[0].a.b[0]'
                                        function
                                        getValue
                                        (

                                            target,
                                            valuePath,
                                            defaultValue

                                        )
                                        {
                                        }
                                        console.
                                        log
                                        (
                                        getValue
                                        (
                                        object,
                                        "a[0].b.c "
                                        ,
                                        0
                                        )
                                        )
                                        ;
                                        // 输出3
                                        console.
                                        log
                                        (
                                        getValue
                                        (
                                        array,
                                        "[0].a.b[0]"
                                        ,
                                        12
                                        )
                                        )
                                        ;
                                        // 输出 1
                                        console.
                                        log
                                        (
                                        getValue
                                        (
                                        array,
                                        "[0].a.b[0].c "
                                        ,
                                        12
                                        )
                                        )
                                        ;
                                        // 输出 12


```
:::

**实现**

::: {.language-js .extra-class}
``` language-js

                                        /**
 * 测试属性是否匹配
 */
                                        export
                                        function
                                        testPropTypes
                                        (

                                            value,
                                            type,
                                            dev

                                        )
                                        {
                                        const
                                        sEnums =
                                        [
                                        'number'
                                        ,
                                        'string'
                                        ,
                                        'boolean'
                                        ,
                                        'undefined'
                                        ,
                                        'function'
                                        ]
                                        ;
                                        // NaN
                                        const
                                        oEnums =
                                        [
                                        'Null'
                                        ,
                                        'Object'
                                        ,
                                        'Array'
                                        ,
                                        'Date'
                                        ,
                                        'RegExp'
                                        ,
                                        'Error'
                                        ]
                                        ;
                                        const
                                        nEnums =
                                        [
                                        '[object Number]'
                                        ,
                                        '[object String]'
                                        ,
                                        '[object Boolean]'
                                        ,
                                        '[object Undefined]'
                                        ,
                                        '[object Function]'
                                        ,
                                        '[object Null]'
                                        ,
                                        '[object Object]'
                                        ,
                                        '[object Array]'
                                        ,
                                        '[object Date]'
                                        ,
                                        '[object RegExp]'
                                        ,
                                        '[object Error]'
                                        ,
                                        ]
                                        ;
                                        const
                                        reg =
                                        new
                                        RegExp
                                        (
                                        '\\[object (.*?)\\]'
                                        )
                                        ;
                                        // 完全匹配模式，type应该传递类似格式[object Window] [object HTMLDocument] ...
                                        if
                                        (
                                        reg.
                                        test
                                        (
                                        type)
                                        )
                                        {
                                        // 排除nEnums的12种
                                        if
                                        (
                                        ~
                                        nEnums.
                                        indexOf
                                        (
                                        type)
                                        )
                                        {
                                        if
                                        (
                                        dev ===
                                        true
                                        )
                                        {
                                        console.
                                        warn
                                        (
                                        value,
                                        'The parameter type belongs to one of 12 types：number string boolean undefined Null Object Array Date RegExp function Error NaN'
                                        )
                                        ;
                                        }
                                        }
                                        if
                                        (
                                        Object
                                        .
                                        prototype.
                                        toString
                                        .
                                        call
                                        (
                                        value)
                                        ===
                                        type)
                                        {
                                        return
                                        true
                                        ;
                                        }
                                        return
                                        false
                                        ;
                                        }
                                        }


```
:::

::: {.language-js .extra-class}
``` language-js

                                        const
                                        syncVarIterator =
                                        {
                                        getter
                                        :
                                        function
                                        (

                                            obj,
                                            key,
                                            defaultValue

                                        )
                                        {
                                        // 结果变量
                                        const
                                        defaultResult =
                                        defaultValue ===
                                        undefined
                                        ?
                                        undefined
                                        :
                                        defaultValue;
                                        if
                                        (
                                        testPropTypes
                                        (
                                        obj,
                                        'Object'
                                        )
                                        ===
                                        false
                                        &&
                                        testPropTypes
                                        (
                                        obj,
                                        'Array'
                                        )
                                        ===
                                        false
                                        )
                                        {
                                        return
                                        defaultResult;
                                        }
                                        // 结果变量，暂时指向obj持有的引用，后续将可能被不断的修改
                                        let
                                        result =
                                        obj;
                                        // 得到知道值
                                        try
                                        {
                                        // 解析属性层次序列
                                        const
                                        keyArr =
                                        key.
                                        split
                                        (
                                        '.'
                                        )
                                        ;
                                        // 迭代obj对象属性
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        keyArr.
                                        length;
                                        i++
                                        )
                                        {
                                        // 如果第 i 层属性存在对应的值则迭代该属性值
                                        if
                                        (
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        !==
                                        undefined
                                        )
                                        {
                                        result =
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        ;
                                        // 如果不存在则返回未定义
                                        }
                                        else
                                        {
                                        return
                                        defaultResult;
                                        }
                                        }
                                        }
                                        catch
                                        (
                                        e)
                                        {
                                        return
                                        defaultResult;
                                        }
                                        // 返回获取的结果
                                        return
                                        result;
                                        }
                                        ,
                                        setter
                                        :
                                        function
                                        (

                                            obj,
                                            key,
                                            val

                                        )
                                        {
                                        // 如果不存在obj则返回未定义
                                        if
                                        (
                                        testPropTypes
                                        (
                                        obj,
                                        'Object'
                                        )
                                        ===
                                        false
                                        )
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        // 结果变量，暂时指向obj持有的引用，后续将可能被不断的修改
                                        let
                                        result =
                                        obj;
                                        try
                                        {
                                        // 解析属性层次序列
                                        const
                                        keyArr =
                                        key.
                                        split
                                        (
                                        '.'
                                        )
                                        ;
                                        let
                                        i =
                                        0
                                        ;
                                        // 迭代obj对象属性
                                        for
                                        (
                                        ;
                                        i <
                                        keyArr.
                                        length -
                                        1
                                        ;
                                        i++
                                        )
                                        {
                                        // 如果第 i 层属性对应的值不存在，则定义为对象
                                        if
                                        (
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        ===
                                        undefined
                                        )
                                        {
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        =
                                        {
                                        }
                                        ;
                                        }
                                        // 如果第 i 层属性对应的值不是对象（Object）的一个实例，则抛出错误
                                        if
                                        (
                                        !
                                        (
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        instanceof
                                        Object
                                        )
                                        )
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        'obj.'
                                        +
                                        keyArr.
                                        splice
                                        (
                                        0
                                        ,
                                        i +
                                        1
                                        )
                                        .
                                        join
                                        (
                                        '.'
                                        )
                                        +
                                        'is not Object'
                                        )
                                        ;
                                        }
                                        // 迭代该层属性值
                                        result =
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        ;
                                        }
                                        // 设置属性值
                                        result[
                                        keyArr[
                                        i]
                                        ]
                                        =
                                        val;
                                        return
                                        true
                                        ;
                                        }
                                        catch
                                        (
                                        e)
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        }
                                        ,
                                        }
                                        ;


```
:::

**使用promise来实现**

创建 `enhancedObject` 函数

::: {.language-js .extra-class}
``` language-js

                                        const
                                        enhancedObject
                                        =
                                        (
                                        target
                                        )
                                        =>
                                        new
                                        Proxy
                                        (
                                        target,
                                        {
                                        get
                                        (
                                        target,
                                        property)
                                        {
                                        if
                                        (
                                        property in
                                        target)
                                        {
                                        return
                                        target[
                                        property]
                                        ;
                                        }
                                        else
                                        {
                                        return
                                        searchFor
                                        (
                                        property,
                                        target)
                                        ;
                                        //实际使用时要对value值进行复位
                                        }
                                        }
                                        ,
                                        }
                                        )
                                        ;
                                        let
                                        value =
                                        null
                                        ;
                                        function
                                        searchFor
                                        (

                                            property,
                                            target

                                        )
                                        {
                                        for
                                        (
                                        const
                                        key of
                                        Object.
                                        keys
                                        (
                                        target)
                                        )
                                        {
                                        if
                                        (
                                        typeof
                                        target[
                                        key]
                                        ===
                                        "object "
                                        )
                                        {
                                        searchFor
                                        (
                                        property,
                                        target[
                                        key]
                                        )
                                        ;
                                        }
                                        else
                                        if
                                        (
                                        typeof
                                        target[
                                        property]
                                        !==
                                        "undefined "
                                        )
                                        {
                                        value =
                                        target[
                                        property]
                                        ;
                                        break
                                        ;
                                        }
                                        }
                                        return
                                        value;
                                        }


```
:::

使用 `enhancedObject` 函数

::: {.language-js .extra-class}
``` language-js

                                        const
                                        data =
                                        enhancedObject
                                        (
                                        {
                                        user
                                        :
                                        {
                                        name
                                        :
                                        "test "
                                        ,
                                        settings
                                        :
                                        {
                                        theme
                                        :
                                        "dark "
                                        ,
                                        }
                                        ,
                                        }
                                        ,
                                        }
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        data.
                                        user.
                                        settings.
                                        theme)
                                        ;
                                        // dark
                                        console.
                                        log
                                        (
                                        data.
                                        theme)
                                        ;
                                        // dark


```
:::

以上代码运行后，控制台会输出以下代码：

::: {.language- .extra-class}
``` language-text
                                    dark
dark


```
:::

> 通过观察以上的输出结果可知，使用 `enhancedObject`
> 函数处理过的对象，我们就可以方便地访问普通对象内部的深层属性。

### [\#](#_8-创建10个标签-点击的时候弹出来对应的序号){.header-anchor} 8 创建10个标签，点击的时候弹出来对应的序号 {#_8-创建10个标签-点击的时候弹出来对应的序号}

::: {.language-js .extra-class}
``` language-js

                                        var
                                        a
for
                                        (
                                        let
                                        i=
                                        0
                                        ;
                                        i<
                                        10
                                        ;
                                        i++
                                        )
                                        {
                                        a=
                                        document.
                                        createElement
                                        (
                                        'a'
                                        )
                                        a.
                                        innerHTML=
                                        i+
                                        '<br >'
                                        a.
                                        addEventListener
                                        (
                                        'click'
                                        ,
                                        function
                                        (
                                        e
                                        )
                                        {
                                        console.
                                        log
                                        (
                                        this
                                        )
                                        //this为当前点击的 <a >
                                        e.
                                        preventDefault
                                        (
                                        )
                                        //如果调用这个方法，默认事件行为将不再触发。
                                        //例如，在执行这个方法后，如果点击一个链接（a标签），浏览器不会跳转到新的 URL 去了。我们可以用 event.isDefaultPrevented() 来确定这个方法是否(在那个事件对象上)被调用过了。
                                        alert
                                        (
                                        i)
                                        }
                                        )
                                        const
                                        d=
                                        document.
                                        querySelector
                                        (
                                        'div'
                                        )
                                        d.
                                        appendChild
                                        (
                                        a)
                                        //append向一个已存在的元素追加该元素。
                                        }


```
:::

### [\#](#_9-版本号排序的方法){.header-anchor} 9 版本号排序的方法 {#_9-版本号排序的方法}

题目描述:有一组版本号如下
`['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5']`
。现在需要对其进行排序，排序的结果为
`['4.3.5','4.3.4.5','2.3.3','0.302.1','0.1.1']`

::: {.language-js .extra-class}
``` language-js

                                        arr.
                                        sort
                                        (
                                        (

                                            a,
                                            b

                                        )
                                        =>
                                        {
                                        let
                                        i =
                                        0
                                        ;
                                        const
                                        arr1 =
                                        a.
                                        split
                                        (
                                        "."
                                        )
                                        ;
                                        const
                                        arr2 =
                                        b.
                                        split
                                        (
                                        "."
                                        )
                                        ;
                                        while
                                        (
                                        true
                                        )
                                        {
                                        const
                                        s1 =
                                        arr1[
                                        i]
                                        ;
                                        const
                                        s2 =
                                        arr2[
                                        i]
                                        ;
                                        i++
                                        ;
                                        if
                                        (
                                        s1 ===
                                        undefined
                                        ||
                                        s2 ===
                                        undefined
                                        )
                                        {
                                        return
                                        arr2.
                                        length -
                                        arr1.
                                        length;
                                        }
                                        if
                                        (
                                        s1 ===
                                        s2)
                                        continue
                                        ;
                                        return
                                        s2 -
                                        s1;
                                        }
                                        }
                                        )
                                        ;
                                        console.
                                        log
                                        (
                                        arr)
                                        ;


```
:::

### [\#](#_10-请实现-dom2json-一个函数-可以把一个-dom-节点输出-json-的格式){.header-anchor} 10 请实现 DOM2JSON 一个函数，可以把一个 DOM 节点输出 JSON 的格式 {#_10-请实现-dom2json-一个函数-可以把一个-dom-节点输出-json-的格式}

::: {.language- .extra-class}
``` language-text
                                    <div ><span ><a ></a ></span ><span ><a ></a ><a ></a ></span ></div >把上面dom结构转成下面的JSON格式

{
  tag: 'DIV',
  children: [
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] }
      ]
    },
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] },
        { tag: 'A', children: [] }
      ]
    }
  ]
}


```
:::

实现代码如下:

::: {.language-js .extra-class}
``` language-js

                                        function
                                        dom2Json
                                        (
                                        domtree
                                        )
                                        {
                                        let
                                        obj =
                                        {
                                        }
                                        ;
                                        obj.
                                        name =
                                        domtree.
                                        tagName;
                                        obj.
                                        children =
                                        [
                                        ]
                                        ;
                                        domtree.
                                        childNodes.
                                        forEach
                                        (
                                        (
                                        child
                                        )
                                        =>
                                        obj.
                                        children.
                                        push
                                        (
                                        dom2Json
                                        (
                                        child)
                                        )
                                        )
                                        ;
                                        return
                                        obj;
                                        }


```
:::

### [\#](#_11-分片思想解决大数据量渲染问题){.header-anchor} 11 分片思想解决大数据量渲染问题 {#_11-分片思想解决大数据量渲染问题}

题目描述: 渲染百万条结构简单的大数据时 怎么使用分片思想优化渲染

::: {.language-js .extra-class}
``` language-js

                                        let
                                        ul =
                                        document.
                                        getElementById
                                        (
                                        "container "
                                        )
                                        ;
                                        // 插入十万条数据
                                        let
                                        total =
                                        100000
                                        ;
                                        // 一次插入 20 条
                                        let
                                        once =
                                        20
                                        ;
                                        //总页数
                                        let
                                        page =
                                        total /
                                        once;
                                        //每条记录的索引
                                        let
                                        index =
                                        0
                                        ;
                                        //循环加载数据
                                        function
                                        loop
                                        (

                                            curTotal,
                                            curIndex

                                        )
                                        {
                                        if
                                        (
                                        curTotal <=
                                        0
                                        )
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        //每页多少条
                                        let
                                        pageCount =
                                        Math.
                                        min
                                        (
                                        curTotal,
                                        once)
                                        ;
                                        window.
                                        requestAnimationFrame
                                        (
                                        function
                                        (
                                        )
                                        {
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        pageCount;
                                        i++
                                        )
                                        {
                                        let
                                        li =
                                        document.
                                        createElement
                                        (
                                        "li "
                                        )
                                        ;
                                        li.
                                        innerText =
                                        curIndex +
                                        i +
                                        ": "
                                        +
                                        ~
                                        ~
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        total)
                                        ;
                                        ul.
                                        appendChild
                                        (
                                        li)
                                        ;
                                        }
                                        loop
                                        (
                                        curTotal -
                                        pageCount,
                                        curIndex +
                                        pageCount)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        loop
                                        (
                                        total,
                                        index)
                                        ;


```
:::

**扩展思考** ：对于大数据量的简单 `dom` 结构渲染可以用分片思想解决
如果是复杂的 `dom` 结构渲染如何处理？

这时候就需要使用**虚拟列表**
了，虚拟列表和虚拟表格在日常项目使用还是很多的

### [\#](#_12-实现一个add方法完成两个大数相加){.header-anchor} 12 实现一个add方法完成两个大数相加 {#_12-实现一个add方法完成两个大数相加}

::: {.language-js .extra-class}
``` language-js

                                        // 题目
                                        let
                                        a =
                                        "9007199254740991 "
                                        ;
                                        let
                                        b =
                                        "1234567899999999999 "
                                        ;
                                        function
                                        add
                                        (

                                            a ,
                                            b

                                        )
                                        {
                                        //...
                                        }


```
:::

实现代码如下:

::: {.language-js .extra-class}
``` language-js

                                        function
                                        add
                                        (

                                            a ,
                                            b

                                        )
                                        {
                                        //取两个数字的最大长度
                                        let
                                        maxLength =
                                        Math.
                                        max
                                        (
                                        a.
                                        length,
                                        b.
                                        length)
                                        ;
                                        //用0去补齐长度
                                        a =
                                        a.
                                        padStart
                                        (
                                        maxLength ,
                                        0
                                        )
                                        ;
                                        //"0009007199254740991 "
                                        b =
                                        b.
                                        padStart
                                        (
                                        maxLength ,
                                        0
                                        )
                                        ;
                                        //"1234567899999999999 "
                                        //定义加法过程中需要用到的变量
                                        let
                                        t =
                                        0
                                        ;
                                        let
                                        f =
                                        0
                                        ;
                                        //"进位 "
                                        let
                                        sum =
                                        ""
                                        ;
                                        for
                                        (
                                        let
                                        i=
                                        maxLength-
                                        1
                                        ;
                                        i>=
                                        0
                                        ;
                                        i--
                                        )
                                        {
                                        t =
                                        parseInt
                                        (
                                        a[
                                        i]
                                        )
                                        +
                                        parseInt
                                        (
                                        b[
                                        i]
                                        )
                                        +
                                        f;
                                        f =
                                        Math.
                                        floor
                                        (
                                        t/
                                        10
                                        )
                                        ;
                                        sum =
                                        t%
                                        10
                                        +
                                        sum;
                                        }
                                        if
                                        (
                                        f!==
                                        0
                                        )
                                        {
                                        sum =
                                        ''
                                        +
                                        f +
                                        sum;
                                        }
                                        return
                                        sum;
                                        }


```
:::

### [\#](#_13-怎么在制定数据源里面生成一个长度为-n-的不重复随机数组-能有几种方法-时间复杂度多少-字节){.header-anchor} 13 怎么在制定数据源里面生成一个长度为 n 的不重复随机数组 能有几种方法 时间复杂度多少（字节） {#_13-怎么在制定数据源里面生成一个长度为-n-的不重复随机数组-能有几种方法-时间复杂度多少-字节}

**第一版 时间复杂度为 O(n\^2)**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        getTenNum
                                        (

                                            testArray,
                                            n

                                        )
                                        {
                                        let
                                        result =
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        n;
                                        ++
                                        i)
                                        {
                                        const
                                        random =
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        testArray.
                                        length)
                                        ;
                                        const
                                        cur =
                                        testArray[
                                        random]
                                        ;
                                        if
                                        (
                                        result.
                                        includes
                                        (
                                        cur)
                                        )
                                        {
                                        i--
                                        ;
                                        break
                                        ;
                                        }
                                        result.
                                        push
                                        (
                                        cur)
                                        ;
                                        }
                                        return
                                        result;
                                        }
                                        const
                                        testArray =
                                        [
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ,
                                        4
                                        ,
                                        5
                                        ,
                                        6
                                        ,
                                        7
                                        ,
                                        8
                                        ,
                                        9
                                        ,
                                        10
                                        ,
                                        11
                                        ,
                                        12
                                        ,
                                        13
                                        ,
                                        14
                                        ]
                                        ;
                                        const
                                        resArr =
                                        getTenNum
                                        (
                                        testArray,
                                        10
                                        )
                                        ;


```
:::

**第二版 标记法 / 自定义属性法 时间复杂度为 O(n)**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        getTenNum
                                        (

                                            testArray,
                                            n

                                        )
                                        {
                                        let
                                        hash =
                                        {
                                        }
                                        ;
                                        let
                                        result =
                                        [
                                        ]
                                        ;
                                        let
                                        ranNum =
                                        n;
                                        while
                                        (
                                        ranNum >
                                        0
                                        )
                                        {
                                        const
                                        ran =
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        testArray.
                                        length)
                                        ;
                                        if
                                        (
                                        !
                                        hash[
                                        ran]
                                        )
                                        {
                                        hash[
                                        ran]
                                        =
                                        true
                                        ;
                                        result.
                                        push
                                        (
                                        ran)
                                        ;
                                        ranNum--
                                        ;
                                        }
                                        }
                                        return
                                        result;
                                        }
                                        const
                                        testArray =
                                        [
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ,
                                        4
                                        ,
                                        5
                                        ,
                                        6
                                        ,
                                        7
                                        ,
                                        8
                                        ,
                                        9
                                        ,
                                        10
                                        ,
                                        11
                                        ,
                                        12
                                        ,
                                        13
                                        ,
                                        14
                                        ]
                                        ;
                                        const
                                        resArr =
                                        getTenNum
                                        (
                                        testArray,
                                        10
                                        )
                                        ;


```
:::

**第三版 交换法 时间复杂度为 O(n)**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        getTenNum
                                        (

                                            testArray,
                                            n

                                        )
                                        {
                                        const
                                        cloneArr =
                                        [
                                        ...
                                        testArray]
                                        ;
                                        let
                                        result =
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        n;
                                        i++
                                        )
                                        {
                                        debugger
                                        ;
                                        const
                                        ran =
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        (
                                        cloneArr.
                                        length -
                                        i)
                                        )
                                        ;
                                        result.
                                        push
                                        (
                                        cloneArr[
                                        ran]
                                        )
                                        ;
                                        cloneArr[
                                        ran]
                                        =
                                        cloneArr[
                                        cloneArr.
                                        length -
                                        i -
                                        1
                                        ]
                                        ;
                                        }
                                        return
                                        result;
                                        }
                                        const
                                        testArray =
                                        [
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ,
                                        4
                                        ,
                                        5
                                        ,
                                        6
                                        ,
                                        7
                                        ,
                                        8
                                        ,
                                        9
                                        ,
                                        10
                                        ,
                                        11
                                        ,
                                        12
                                        ,
                                        13
                                        ,
                                        14
                                        ]
                                        ;
                                        const
                                        resArr =
                                        getTenNum
                                        (
                                        testArray,
                                        14
                                        )
                                        ;


```
:::

值得一提的是操作数组的时候使用交换法 这种思路在算法里面很常见

**最终版 边遍历边删除 时间复杂度为 O(n)**

::: {.language-js .extra-class}
``` language-js

                                        function
                                        getTenNum
                                        (

                                            testArray,
                                            n

                                        )
                                        {
                                        const
                                        cloneArr =
                                        [
                                        ...
                                        testArray]
                                        ;
                                        let
                                        result =
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        n;
                                        ++
                                        i)
                                        {
                                        const
                                        random =
                                        Math.
                                        floor
                                        (
                                        Math.
                                        random
                                        (
                                        )
                                        *
                                        cloneArr.
                                        length)
                                        ;
                                        const
                                        cur =
                                        cloneArr[
                                        random]
                                        ;
                                        result.
                                        push
                                        (
                                        cur)
                                        ;
                                        cloneArr.
                                        splice
                                        (
                                        random,
                                        1
                                        )
                                        ;
                                        }
                                        return
                                        result;
                                        }
                                        const
                                        testArray =
                                        [
                                        1
                                        ,
                                        2
                                        ,
                                        3
                                        ,
                                        4
                                        ,
                                        5
                                        ,
                                        6
                                        ,
                                        7
                                        ,
                                        8
                                        ,
                                        9
                                        ,
                                        10
                                        ,
                                        11
                                        ,
                                        12
                                        ,
                                        13
                                        ,
                                        14
                                        ]
                                        ;
                                        const
                                        resArr =
                                        getTenNum
                                        (
                                        testArray,
                                        14
                                        )
                                        ;


```
:::

### [\#](#_14-查找数组公共前缀-美团){.header-anchor} 14 查找数组公共前缀（美团） {#_14-查找数组公共前缀-美团}

题目描述

::: {.language- .extra-class}
``` language-text
                                    编写一个函数来查找字符串数组中的最长公共前缀。
如果不存在公共前缀，返回空字符串 ""。

示例 1：

输入：strs = ["flower ","flow ","flight "]
输出："fl "示例 2：

输入：strs = ["dog ","racecar ","car "]
输出：""解释：输入不存在公共前缀。


```
:::

答案

::: {.language-js .extra-class}
``` language-js

                                        const
                                        longestCommonPrefix
                                        =
                                        function
                                        (
                                        strs
                                        )
                                        {
                                        const
                                        str =
                                        strs[
                                        0
                                        ]
                                        ;
                                        let
                                        index =
                                        0
                                        ;
                                        while
                                        (
                                        index <
                                        str.
                                        length)
                                        {
                                        const
                                        strCur =
                                        str.
                                        slice
                                        (
                                        0
                                        ,
                                        index +
                                        1
                                        )
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        strs.
                                        length;
                                        i++
                                        )
                                        {
                                        if
                                        (
                                        !
                                        strs[
                                        i]
                                        ||
                                        !
                                        strs[
                                        i]
                                        .
                                        startsWith
                                        (
                                        strCur)
                                        )
                                        {
                                        return
                                        str.
                                        slice
                                        (
                                        0
                                        ,
                                        index)
                                        ;
                                        }
                                        }
                                        index++
                                        ;
                                        }
                                        return
                                        str;
                                        }
                                        ;


```
:::

### [\#](#_15-判断括号字符串是否有效-小米){.header-anchor} 15 判断括号字符串是否有效（小米） {#_15-判断括号字符串是否有效-小米}

题目描述

::: {.language- .extra-class}
``` language-text
                                    给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。

有效字符串需满足：
- 左括号必须用相同类型的右括号闭合。
- 左括号必须以正确的顺序闭合。

示例 1：

输入：s = "()"输出：true

示例 2：

输入：s = "()[]{}"输出：true

示例 3：

输入：s = "(]"输出：false


```
:::

答案

::: {.language-js .extra-class}
``` language-js

                                        const
                                        isValid
                                        =
                                        function
                                        (
                                        s
                                        )
                                        {
                                        if
                                        (
                                        s.
                                        length %
                                        2
                                        ===
                                        1
                                        )
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        const
                                        regObj =
                                        {
                                        "{"
                                        :
                                        "}"
                                        ,
                                        "("
                                        :
                                        ")"
                                        ,
                                        "["
                                        :
                                        "]"
                                        ,
                                        }
                                        ;
                                        let
                                        stack =
                                        [
                                        ]
                                        ;
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        s.
                                        length;
                                        i++
                                        )
                                        {
                                        if
                                        (
                                        s[
                                        i]
                                        ===
                                        "{"
                                        ||
                                        s[
                                        i]
                                        ===
                                        "("
                                        ||
                                        s[
                                        i]
                                        ===
                                        "["
                                        )
                                        {
                                        stack.
                                        push
                                        (
                                        s[
                                        i]
                                        )
                                        ;
                                        }
                                        else
                                        {
                                        const
                                        cur =
                                        stack.
                                        pop
                                        (
                                        )
                                        ;
                                        if
                                        (
                                        s[
                                        i]
                                        !==
                                        regObj[
                                        cur]
                                        )
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        }
                                        }
                                        if
                                        (
                                        stack.
                                        length)
                                        {
                                        return
                                        false
                                        ;
                                        }
                                        return
                                        true
                                        ;
                                        }
                                        ;


```
:::

### [\#](#_16-实现一个padstart-或padend-的polyfil){.header-anchor} 16 实现一个padStart()或padEnd()的polyfil {#_16-实现一个padstart-或padend-的polyfil}

`String.prototype.padStart` 和 `String.prototype.padEnd` 是`ES8`
中新增的方法，允许将空字符串或其他字符串添加到原始字符串的开头或结尾。我们先看下使用语法：

::: {.language-javascript .extra-class}
``` language-javascript

                                        String.
                                        padStart
                                        (
                                        targetLength,
                                        [
                                        padString]
                                        )


```
:::

用法：

::: {.language-javascript .extra-class}
``` language-javascript

                                        'x'
                                        .
                                        padStart
                                        (
                                        4
                                        ,
                                        'ab'
                                        )
                                        // 'abax'
                                        'x'
                                        .
                                        padEnd
                                        (
                                        5
                                        ,
                                        'ab'
                                        )
                                        // 'xabab'
                                        // 1. 若是输入的目标长度小于字符串原本的长度则返回字符串本身
                                        'xxx'
                                        .
                                        padStart
                                        (
                                        2
                                        ,
                                        's'
                                        )
                                        // 'xxx'
                                        // 2. 第二个参数的默认值为 ""，长度是为1的
                                        // 3. 而此参数可能是个不确定长度的字符串，若是要填充的内容达到了目标长度，则将不要的部分截取
                                        'xxx'
                                        .
                                        padStart
                                        (
                                        5
                                        ,
                                        'sss'
                                        )
                                        // ssxxx
                                        // 4. 可用来处理日期、金额格式化问题
                                        '12'
                                        .
                                        padStart
                                        (
                                        10
                                        ,
                                        'YYYY-MM-DD'
                                        )
                                        // "YYYY-MM-12 "
                                        '09-12'
                                        .
                                        padStart
                                        (
                                        10
                                        ,
                                        'YYYY-MM-DD'
                                        )
                                        // "YYYY-09-12 "


```
:::

polyfill实现：

::: {.language-javascript .extra-class}
``` language-javascript

                                        String
                                        .
                                        prototype.
                                        myPadStart
                                        =
                                        function
                                        (
                                        targetLen,
                                        padString =
                                        ""
                                        )
                                        {
                                        if
                                        (
                                        !
                                        targetLen)
                                        {
                                        throw
                                        new
                                        Error
                                        (
                                        '请输入需要填充到的长度'
                                        )
                                        ;
                                        }
                                        let
                                        originStr =
                                        String
                                        (
                                        this
                                        )
                                        ;
                                        // 获取到调用的字符串, 因为this原本是String{}，所以需要用String转为字符串
                                        let
                                        originLen =
                                        originStr.
                                        length;
                                        // 调用的字符串原本的长度
                                        if
                                        (
                                        originLen >=
                                        targetLen)
                                        return
                                        originStr;
                                        // 若是 原本 >目标 则返回原本字符串
                                        let
                                        diffNum =
                                        targetLen -
                                        originLen;
                                        // 10 - 6 // 差值
                                        for
                                        (
                                        let
                                        i =
                                        0
                                        ;
                                        i <
                                        diffNum;
                                        i++
                                        )
                                        {
                                        // 要添加几个成员
                                        for
                                        (
                                        let
                                        j =
                                        0
                                        ;
                                        j <
                                        padString.
                                        length;
                                        j++
                                        )
                                        {
                                        // 输入的padString的长度可能不为1
                                        if
                                        (
                                        originStr.
                                        length ===
                                        targetLen)
                                        break
                                        ;
                                        // 判断每一次添加之后是否到了目标长度
                                        originStr =

                                            `

                                                ${
                                                padString[
                                                j]
                                                }


                                                ${
                                                originStr}

                                            `

                                        ;
                                        }
                                        if
                                        (
                                        originStr.
                                        length ===
                                        targetLen)
                                        break
                                        ;
                                        }
                                        return
                                        originStr;
                                        }
                                        console.
                                        log
                                        (
                                        'xxx'
                                        .
                                        myPadStart
                                        (
                                        16
                                        )
                                        )
                                        console.
                                        log
                                        (
                                        'xxx'
                                        .
                                        padStart
                                        (
                                        16
                                        )
                                        )


```
:::

还是比较简单的，而`padEnd` 的实现和它一样，只需要把第二层`for`
循环里的`${padString[j]}${orignStr}` 换下位置就可以了。

### [\#](#_17-设计一个方法提取对象中所有value大于2的键值对并返回最新的对象){.header-anchor} 17 设计一个方法提取对象中所有value大于2的键值对并返回最新的对象 {#_17-设计一个方法提取对象中所有value大于2的键值对并返回最新的对象}

实现：

::: {.language-js .extra-class}
``` language-js

                                        var
                                        obj =
                                        {
                                        a
                                        :
                                        1
                                        ,
                                        b
                                        :
                                        3
                                        ,
                                        c
                                        :
                                        4
                                        }
                                        foo
                                        (
                                        obj)
                                        // { b: 3, c: 4 }


```
:::

方法有很多种，这里提供一种比较简洁的写法，用到了`ES10`
的`Object.fromEntries()` ：

::: {.language-javascript .extra-class}
``` language-javascript

                                        var
                                        obj =
                                        {
                                        a
                                        :
                                        1
                                        ,
                                        b
                                        :
                                        3
                                        ,
                                        c
                                        :
                                        4
                                        }
                                        function
                                        foo
                                        (
                                        obj
                                        )
                                        {
                                        return
                                        Object.
                                        fromEntries
                                        (
                                        Object.
                                        entries
                                        (
                                        obj)
                                        .
                                        filter
                                        (
                                        (

                                            [
                                            key,
                                            value]

                                        )
                                        =>
                                        value >
                                        2
                                        )
                                        )
                                        }
                                        var
                                        obj2 =
                                        foo
                                        (
                                        obj)
                                        // { b: 3, c: 4 }
                                        console.
                                        log
                                        (
                                        obj2)


```
:::

::: {.language-javascript .extra-class}
``` language-javascript

                                        // ES8中 Object.entries()的作用：
                                        var
                                        obj =
                                        {
                                        a
                                        :
                                        1
                                        ,
                                        b
                                        :
                                        2
                                        }
                                        var
                                        entries =
                                        Object.
                                        entries
                                        (
                                        obj)
                                        ;
                                        // [['a', 1], ['b', 2]]
                                        // ES10中 Object.fromEntries()的作用：
                                        Object.
                                        fromEntries
                                        (
                                        entries)
                                        ;
                                        // { a: 1, b: 2 }


```
:::

### [\#](#_18-实现一个拖拽){.header-anchor} 18 实现一个拖拽 {#_18-实现一个拖拽}

::: {.language-html .extra-class}
``` language-html



                                                <
                                                style

                                            >



                                                html, body
                                                {
                                                margin
                                                :
                                                0;
                                                height
                                                :
                                                100%;
                                                }
                                                #box
                                                {
                                                width
                                                :
                                                100px;
                                                height
                                                :
                                                100px;
                                                background-color
                                                :
                                                red;
                                                position
                                                :
                                                absolute;
                                                top
                                                :
                                                100px;
                                                left
                                                :
                                                100px;
                                                }




                                                </
                                                style

                                            >



```
:::

::: {.language-html .extra-class}
``` language-html



                                                <
                                                div

                                            id

                                                =
                                                "
                                                box"

                                            >



                                                </
                                                div

                                            >



```
:::

::: {.language-js .extra-class}
``` language-js

                                        window.
                                        onload
                                        =
                                        function
                                        (
                                        )
                                        {
                                        var
                                        box =
                                        document.
                                        getElementById
                                        (
                                        'box'
                                        )
                                        ;
                                        box.
                                        onmousedown
                                        =
                                        function
                                        (
                                        ev
                                        )
                                        {
                                        var
                                        oEvent =
                                        ev ||
                                        window.
                                        event;
                                        // 兼容火狐,火狐下没有window.event
                                        var
                                        distanceX =
                                        oEvent.
                                        clientX -
                                        box.
                                        offsetLeft;
                                        // 鼠标到可视区左边的距离 - box到页面左边的距离
                                        var
                                        distanceY =
                                        oEvent.
                                        clientY -
                                        box.
                                        offsetTop;
                                        document.
                                        onmousemove
                                        =
                                        function
                                        (
                                        ev
                                        )
                                        {
                                        var
                                        oEvent =
                                        ev ||
                                        window.
                                        event;
                                        var
                                        left =
                                        oEvent.
                                        clientX -
                                        distanceX;
                                        var
                                        top =
                                        oEvent.
                                        clientY -
                                        distanceY;
                                        if
                                        (
                                        left <=
                                        0
                                        )
                                        {
                                        left =
                                        0
                                        ;
                                        }
                                        else
                                        if
                                        (
                                        left >=
                                        document.
                                        documentElement.
                                        clientWidth -
                                        box.
                                        offsetWidth)
                                        {
                                        left =
                                        document.
                                        documentElement.
                                        clientWidth -
                                        box.
                                        offsetWidth;
                                        }
                                        if
                                        (
                                        top <=
                                        0
                                        )
                                        {
                                        top =
                                        0
                                        ;
                                        }
                                        else
                                        if
                                        (
                                        top >=
                                        document.
                                        documentElement.
                                        clientHeight -
                                        box.
                                        offsetHeight)
                                        {
                                        top =
                                        document.
                                        documentElement.
                                        clientHeight -
                                        box.
                                        offsetHeight;
                                        }
                                        box.
                                        style.
                                        left =
                                        left +
                                        'px'
                                        ;
                                        box.
                                        style.
                                        top =
                                        top +
                                        'px'
                                        ;
                                        }
                                        box.
                                        onmouseup
                                        =
                                        function
                                        (
                                        )
                                        {
                                        document.
                                        onmousemove =
                                        null
                                        ;
                                        box.
                                        onmouseup =
                                        null
                                        ;
                                        }
                                        }
                                        }


```
:::

### [\#](#_19-基于promise-all实现ajax的串行和并行){.header-anchor} 19 基于Promise.all实现Ajax的串行和并行 {#_19-基于promise-all实现ajax的串行和并行}

> 基于Promise.all实现Ajax的串行和并行

-   串行：请求是异步的，需要等待上一个请求成功，才能执行下一个请求
-   并行：同时发送多个请求「`HTTP`
    请求可以同时进行，但是JS的操作都是一步步的来的，因为JS是单线程」,等待所有请求都成功，我们再去做什么事情?

::: {.language-js .extra-class}
``` language-js

                                        Promise.
                                        all
                                        (
                                        [
                                        axios.
                                        get
                                        (
                                        '/user/list'
                                        )
                                        ,
                                        axios.
                                        get
                                        (
                                        '/user/list'
                                        )
                                        ,
                                        axios.
                                        get
                                        (
                                        '/user/list'
                                        )
                                        ]
                                        )
                                        .
                                        then
                                        (
                                        results
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        results)
                                        ;
                                        }
                                        )
                                        .
                                        catch
                                        (
                                        reason
                                        =>
                                        {
                                        }
                                        )
                                        ;


```
:::

**Promise.all并发限制及async-pool的应用**

> 并发限制指的是，每个时刻并发执行的promise数量是固定的，最终的执行结果还是保持与原来的

::: {.language-js .extra-class}
``` language-js

                                        const
                                        delay
                                        =
                                        function
                                        delay
                                        (
                                        interval
                                        )
                                        {
                                        return
                                        new
                                        Promise
                                        (
                                        (

                                            resolve,
                                            reject

                                        )
                                        =>
                                        {
                                        setTimeout
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        // if (interval === 1003) reject('xxx');
                                        resolve
                                        (
                                        interval)
                                        ;
                                        }
                                        ,
                                        interval)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        ;
                                        let
                                        tasks =
                                        [
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1000
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1003
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1005
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1002
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1004
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1006
                                        )
                                        ;
                                        }
                                        ]
                                        ;
                                        /* Promise.all(tasks.map(task =>task())).then(results =>{
    console.log(results);
}); */
                                        let
                                        results =
                                        [
                                        ]
                                        ;
                                        asyncPool
                                        (
                                        2
                                        ,
                                        tasks,
                                        (

                                            task,
                                            next

                                        )
                                        =>
                                        {
                                        task
                                        (
                                        )
                                        .
                                        then
                                        (
                                        result
                                        =>
                                        {
                                        results.
                                        push
                                        (
                                        result)
                                        ;
                                        next
                                        (
                                        )
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        results)
                                        ;
                                        }
                                        )
                                        ;


```
:::

::: {.language-js .extra-class}
``` language-js

                                        const
                                        delay
                                        =
                                        function
                                        delay
                                        (
                                        interval
                                        )
                                        {
                                        return
                                        new
                                        Promise
                                        (
                                        (

                                            resolve,
                                            reject

                                        )
                                        =>
                                        {
                                        setTimeout
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        resolve
                                        (
                                        interval)
                                        ;
                                        }
                                        ,
                                        interval)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        ;
                                        let
                                        tasks =
                                        [
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1000
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1003
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1005
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1002
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1004
                                        )
                                        ;
                                        }
                                        ,
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        delay
                                        (
                                        1006
                                        )
                                        ;
                                        }
                                        ]
                                        ;


```
:::

**JS实现Ajax并发请求控制的两大解决方案**

> `tasks`
> ：数组，数组包含很多方法，每一个方法执行就是发送一个请求「基于`Promise`
> 管理」

::: {.language-js .extra-class}
``` language-js

                                        function
                                        createRequest
                                        (

                                            tasks,
                                            pool

                                        )
                                        {
                                        pool =
                                        pool ||
                                        5
                                        ;
                                        let
                                        results =
                                        [
                                        ]
                                        ,
                                        together =
                                        new
                                        Array
                                        (
                                        pool)
                                        .
                                        fill
                                        (
                                        null
                                        )
                                        ,
                                        index =
                                        0
                                        ;
                                        together =
                                        together.
                                        map
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        return
                                        new
                                        Promise
                                        (
                                        (

                                            resolve,
                                            reject

                                        )
                                        =>
                                        {
                                        const
                                        run
                                        =
                                        function
                                        run
                                        (
                                        )
                                        {
                                        if
                                        (
                                        index >=
                                        tasks.
                                        length)
                                        {
                                        resolve
                                        (
                                        )
                                        ;
                                        return
                                        ;
                                        }
                                        ;
                                        let
                                        old_index =
                                        index,
                                        task =
                                        tasks[
                                        index++
                                        ]
                                        ;
                                        task
                                        (
                                        )
                                        .
                                        then
                                        (
                                        result
                                        =>
                                        {
                                        results[
                                        old_index]
                                        =
                                        result;
                                        run
                                        (
                                        )
                                        ;
                                        }
                                        )
                                        .
                                        catch
                                        (
                                        reason
                                        =>
                                        {
                                        reject
                                        (
                                        reason)
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        ;
                                        run
                                        (
                                        )
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        )
                                        ;
                                        return
                                        Promise.
                                        all
                                        (
                                        together)
                                        .
                                        then
                                        (
                                        (
                                        )
                                        =>
                                        results)
                                        ;
                                        }
                                        /* createRequest(tasks, 2).then(results =>{
    // 都成功，整体才是成功，按顺序存储结果
    console.log('成功-->', results);
}).catch(reason =>{
    // 只要有也给失败，整体就是失败
    console.log('失败-->', reason);
}); */


```
:::

::: {.language-js .extra-class}
``` language-js

                                        function
                                        createRequest
                                        (

                                            tasks,
                                            pool,
                                            callback

                                        )
                                        {
                                        if
                                        (
                                        typeof
                                        pool ===
                                        "function "
                                        )
                                        {
                                        callback =
                                        pool;
                                        pool =
                                        5
                                        ;
                                        }
                                        if
                                        (
                                        typeof
                                        pool !==
                                        "number "
                                        )
                                        pool =
                                        5
                                        ;
                                        if
                                        (
                                        typeof
                                        callback !==
                                        "function "
                                        )
                                        callback
                                        =
                                        function
                                        (
                                        )
                                        {
                                        }
                                        ;
                                        //------
                                        class
                                        TaskQueue
                                        {
                                        running =
                                        0
                                        ;
                                        queue =
                                        [
                                        ]
                                        ;
                                        results =
                                        [
                                        ]
                                        ;
                                        pushTask
                                        (
                                        task
                                        )
                                        {
                                        let
                                        self =
                                        this
                                        ;
                                        self.
                                        queue.
                                        push
                                        (
                                        task)
                                        ;
                                        self.
                                        next
                                        (
                                        )
                                        ;
                                        }
                                        next
                                        (
                                        )
                                        {
                                        let
                                        self =
                                        this
                                        ;
                                        while
                                        (
                                        self.
                                        running <
                                        pool &&
                                        self.
                                        queue.
                                        length)
                                        {
                                        self.
                                        running++
                                        ;
                                        let
                                        task =
                                        self.
                                        queue.
                                        shift
                                        (
                                        )
                                        ;
                                        task
                                        (
                                        )
                                        .
                                        then
                                        (
                                        result
                                        =>
                                        {
                                        self.
                                        results.
                                        push
                                        (
                                        result)
                                        ;
                                        }
                                        )
                                        .
                                        finally
                                        (
                                        (
                                        )
                                        =>
                                        {
                                        self.
                                        running--
                                        ;
                                        self.
                                        next
                                        (
                                        )
                                        ;
                                        }
                                        )
                                        ;
                                        }
                                        if
                                        (
                                        self.
                                        running ===
                                        0
                                        )
                                        callback
                                        (
                                        self.
                                        results)
                                        ;
                                        }
                                        }
                                        let
                                        TQ
                                        =
                                        new
                                        TaskQueue
                                        ;
                                        tasks.
                                        forEach
                                        (
                                        task
                                        =>
                                        TQ
                                        .
                                        pushTask
                                        (
                                        task)
                                        )
                                        ;
                                        }
                                        createRequest
                                        (
                                        tasks,
                                        2
                                        ,
                                        results
                                        =>
                                        {
                                        console.
                                        log
                                        (
                                        results)
                                        ;
                                        }
                                        )
                                        ;


```
:::

### [\#](#_20-修改嵌套层级很深对象的-key){.header-anchor} 20 修改嵌套层级很深对象的 key {#_20-修改嵌套层级很深对象的-key}

::: {.language-js .extra-class}
``` language-js

                                        // 有一个嵌套层次很深的对象，key 都是 a_b 形式 ，需要改成 ab 的形式，注意不能用递归。
                                        const
                                        a =
                                        {
                                        a_y
                                        :
                                        {
                                        a_z
                                        :
                                        {
                                        y_x
                                        :
                                        6
                                        }
                                        ,
                                        b_c
                                        :
                                        1
                                        }
                                        }
                                        // {
                                        //   ay: {
                                        //     az: {
                                        //       yx: 6
                                        //     },
                                        //     bc: 1
                                        //   }
                                        // }


```
:::

**方法1：序列化 JSON.stringify + 正则匹配**

::: {.language-js .extra-class}
``` language-js

                                        const
                                        regularExpress
                                        =
                                        (
                                        obj
                                        )
                                        =>
                                        {
                                        try
                                        {
                                        const
                                        str =
                                        JSON
                                        .
                                        stringify
                                        (
                                        obj)
                                        .
                                        replace
                                        (

                                            /
                                            _
                                            /
                                            g

                                        ,
                                        ""
                                        )
                                        ;
                                        return
                                        JSON
                                        .
                                        parse
                                        (
                                        str)
                                        ;
                                        }
                                        catch
                                        (
                                        error)
                                        {
                                        return
                                        obj;
                                        }
                                        }
                                        ;
                                        ;


```
:::

**方法2：递归**

::: {.language-js .extra-class}
``` language-js

                                        const
                                        recursion
                                        =
                                        (
                                        obj
                                        )
                                        =>
                                        {
                                        const
                                        keys =
                                        Object.
                                        keys
                                        (
                                        obj)
                                        ;
                                        keys.
                                        forEach
                                        (
                                        (
                                        key
                                        )
                                        =>
                                        {
                                        const
                                        newKey =
                                        key.
                                        replace
                                        (

                                            /
                                            _
                                            /
                                            g

                                        ,
                                        ""
                                        )
                                        ;
                                        obj[
                                        newKey]
                                        =
                                        recursion
                                        (
                                        obj[
                                        key]
                                        )
                                        ;
                                        delete
                                        obj[
                                        key]
                                        ;
                                        }
                                        )
                                        ;
                                        return
                                        obj;
                                        }
                                        ;


```
:::
:::

::: readMore-wrapper
[阅读全文]{.readMore}
:::
:::

::: last-updated
[Last Updated:]{.prefix} [10/12/2023, 9:26:06 AM]{.time}
:::

::: page-nav
[ ← [高频篇](/docs/base/high-frequency.html){.prev} ]{.prev} [
[综合题型](/docs/base/comprehensive.html) → ]{.next}
:::

::: {.location v-4f14edf8=""}
::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAB3lJREFUeF7lW2usHVUV/tY+qU14+AMpT0ONAX/5Q5EgoLxCgq/WBwVEgZT2nNlzKBLR8IiEREiURBTQ3IaeWXOO10DrDx4FrUhrQiAagQIlmBgjlaBEEQUCicVq0s4ss05mTuaee+45e8/MvT2169fJvev5zZ69115rDWGRqd1uH5Om6RoAHwJwtIisIKKj9TeAFZn5NwG8JSJvEVH/N4DdxpiHOp3OG4vpIi2G8mazudIYcyERXQTg0xVtbBeRrWma/qrX671aUdc88VoBsNa2AHwRwOfqdjTT9yiAR5i5W5f+WgAIw/CiNE2vJaLz6nJsnB4RedIYMxNF0daq9ioB0Gq1zjPGXAtAl/qBIH01Zrrd7pNljZcCoNVqvd8Y820AuuSngbppmt7W7Xb/5uuMNwDW2ksAfCfb1X3tLSb/bgC3MPMDPka8ALDW3gXgGz4GDgDv3cz8TVe7zgBYa58CcKar4gPM9zQzn+XigxMA1lpxUTZtPMw8Mb6JDNbaLQC+Om3BOfrzU2a+fBzvWACCILiciDY7GptKNhG5Io5jfYgjaUEArLUfB/DMVEbl79QZzLxzlNhIAJrN5lGNRuOXABSE/wfamSTJZ3u93tvDwYwEwFobT1GSU9cD6DJzMBGALL19oi6rJfT8VUReMMa8ISJ6NT4JwEcAfLiErjkiaZqeP5w2z1sB1tqHDlBu/3sAcaPRuG/Tpk3vDAe7bt26FcuWLfsEAE3BFZAytJWZtTYxoDkA6K1ORBSApabHAVzGzFoImUjW2lszICbyzlvyRGuKt8g5AARB8MRSXWkLjt3BzDf5RpKtCO9qkV6l4zg+P7c3ACArZujmt2RERDuiKJpTMdqwYcMRSZKcKiKnAjgXwH8BvEZEj0VRpCtlQNbaEECnhMNBXlQZABCGoZaePlVCWWkRY8zqTqfzi1xBq9U62xij1R6tH46iO5n5+iEQdgC40MeJIvB9AJrN5smNRuNPPkpq4N3GzJ/P9WT7z08AHDlB90Zm1iJMn8IwbIvIJl9/kiQ5pdfrvdwHwFp7A4A7fJVU4SeiG6Io+kGuw1r7MwADQCbovjS/97fb7dPTNB2Z5U3QcSMzf78PQBAEvyais6sE5CtLRFdGUTS4Z1hr3wVwuKOeOa+CtXYPgCMcZftsIvKbOI7PIWvt8QD+7iNcB28xKfFNvoZ38gqn1wkKwDUANtYRlI+OKgDooi2Wxq21L5Us0X1NAbgbwHU+ztfBWwWANE0/2O12/1zYP/7lsHmOcvuHCsB9AK6oIygfHWUBIKKroyganP3WWgsg8rFd4N1MQRBsJ6IlPf/VgRIA6FPWgqemwQOy1j4P4GNlABCRHboCSisoYzSXcQTgbc0AReTl5cuX3zUzM6MgDCgMw1kRuaqCH7sUgL8AWFlBySjR/wDQxOp9AE4cxeACgIjcE8exbtLzqKa961UF4N8ADqsJAD3LNxpjNnY6ndfWr19/ZKPRiIjoK8P6XQAAMEh4ChveJwGsralgs7c2AESkkzUs/1AMNgiCq4hotiQA2/bt29ecnZ19MwiCVcaYtSJycU0PS9X0AajjFZh3SSk8sRsBfK8kALnYPwAcV2Pguar+K1B1E/wxMzeLzumVdv/+/dcT0Rkiot2k91YEYBFi76vcVfUY3MXMpxW9y6o1els7apzXjnvAYgXe15sfg1USoZCZubDctV4355xeKIJpAADA5iqp8LvMPLi7h2F4mog85/rIpgSAfip8NYB7XB3P+TQ5ieP4lMLTvxnAd131TAkAGygbY/unq+MFAOYUF32vpNMAgDHm2Lwi9FiJcbY9zDzY3YMg+BYR3e4I5LDsGiJ60FG2LrbtzPyZvCIUENFgM3O1ICIfjeP4ReW31mphUguULvQAM19aeH30Oq7X8iUjEbFxHMd5UXRlo9HQhMiLciWFQFxOlD0isjaO44cLcj8HsNrLeEXmJEk+oIOXxb6Alqd9BxyfY+bTi75M6Nq8ZIxpdjqd3+Yy7XZ7VZqm2yrG4yv+KDOvUqHKjRERuT+O4y8XPQiC4Cwi0pxdG5vvAbBTRHbu3bv32S1btsy50taQifoGr/zzGyP9v5ZsjYnIF+I41mXsRdbaewFc6SVUkXnB1pjqrdgcvZWZb3PxL7sr3Kl7pwt/nTw0rjmqhiq2x3Wp367LvdvtzsstsoamVSf0BKkzMEdd49vjqsS3Rj/G8B8B/I6IXgFwvIic4NvDcwzKmc1pQCJbBYfuiEy2CnQYWlvRC3VpnVGfEsbdaZpeMGqYetyYnA5F3z8lAVR1Y15tMVc4dlDyIBmOngTO2OFpl1HZg2lIehiMiUPTEwHINsVDd1g6h/QgG5qeOCTttAcMr6eDYXh60nD0cExOr0BRKBui/tEUzhHrmMzXFxqKXmin9AZAFWXD1NrsmJqPppIkuWnUMPSkI6IUALnSQ/azuWFUD9kPJ4eB0GlTLYQs1sClDjiKyINT9+nsMBDZ4OWXRGR11fE7HWcjom1Jkjysg42T3mnf/1faA1yMZWN4+mntyZ6fz2uwen9/3cVOWZ7/AX1NhacO32+lAAAAAElFTkSuQmCC){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABACAYAAABbYipTAAAAAXNSR0IArs4c6QAAB/pJREFUeF7tW32MXFUV/503r9MmtJGSQEQhQkIMHxG11qQSrTQpKolCVfygot01M/etUypSq/IHSeUPgxq14uJ07n1v3ZbGChaJ1I/EGGHVYqOI33VjqmlTRBsxaop1s7sz75jTzJB1OjPvvvvezE5lT7LZZN/5nXPPb8+9755z7yMsiTMD5Ix0AG7btm357OzsJXEcX9poNE4cO3bsxNTUVN3B1FBA+kaeUmoNM68jotcBuJqZLyWiC9ujZua/ADhBRL8B8Asimp6bm5uenJx8digY6jGIXMlTSm0AcBuANwG4JGPwBwAcMMbI76GUXMgLguA2Zn4fgLf0IcojAB5evnz5vePj47N9sO9sMhN5QRBcDeALzPxm5xHYA58kok9rrR+xh/RX05k8pdS7hLgcpmfaCL/i+/4d1Wr132mBees7kaeU+iSAnXkPJoW9I77vb6pWq39MgcldNTV5Q0Dc8yTEcbw+iqIf586KpcFU5A0Tca34iOgarfXvLePNVc2aPKXUhwHcl6v3HIwx85znea9eDAKtyKtUKlfV6/UfAjhrk9shftn0/gjA3wG8FcBlKTlq4f8G4AYAV1ngZQ28sVqtPm2hm5uKFXlKqa8C2JzklZmniGizMeavojs6OnphsVjc1dwDJsHluWyI72jhd+7cWTx58uTtzPz5JDAR3ae1/kiSXp7PE8kbGxsbieN40sYpEV2ntT68UDcIgm3M/KUkPDM/G4bhRe16pVLpWs/zfp2El+dE9EattWT9QCSRPKXUdwHcaDMaY0xHe0opTsJL1oZhKOXdWVIulx8nouuTbAA4aIy52UIvF5We5FUqlSvq9fpRW09E9M72CkAp9XEAn7Gw8RwRrWtf+Eul0vWe5z1ugReV/wC4ojXtLTHOaj3JSxF4awDPeJ43VqvVvi1/aAZ+J4CbLEd4xPO8uxbgX+N53tvSbMiJ6L1a64cs/WVS60leEASHpa3k4EHeev8C8AoHrECeZuZ/EtG1lvjjzHwcwDWe5x3QWm+1xGVSS8o8eWu+OJOH/MG/BDAVx/FB3/eP12o1IW1RpCt5IyMjK4rF4syijOpsp78FsD+O40ejKJpuboE2MvNGIpJG6/kAzvwQEUvWAmj9/ISZH1uxYsXh8fHxU3nG05U8pdSVAKbzdOZg6ztCmjFmf3MNvaVQKGxhZukb+intzRDRDxqNxt4oih5Oie2o3pW8IAjWMvOTeThxtHG3MeZTglVKlQBsAfB6R1vtsEMA9hpjoiz2upJXqVRW1uv157IYd8US0Sat9aPlcvlVRCStr02uthJw32Tme8Iw/JWL/aQXxh8AvNzFsCuGiLZorR9QSkmpJcTJWtZPkV3BPcaYL6Z1krRVeYSZ357WqKs+EdW01h9SSn0UwOdc7Tji7kxLYFLmSWUgFcIg5EFjzK3lcvmDRDQxCIftPph5NAzDPba+kzJvPTNLK6rfctzzvA2NRuMlRPREv531sh/H8YYoiqZsxmDTGPg+gI02xlx1Wv9xpdQ3ALzD1U4euF4Ninb7NuTJNiHMY2CdbBDRHq31qFJK+oXSN0ySQ8w8QUTSZL1FSrIkADPXiOgxAHLiJz9JIi8QOeTqKYnkNbcsvwPwsiRjLs+l8JdGgFLqZwBe28tGp6xIancx83gYhnKEcEaUUtKokCPTnlIoFK7cvXu37Da6SiJ5TYdSaN+f5DDtcyKamZ2dvaBYLK4H8L0kfKf1KOlQqlOP0bI/+AljzGczkycGyuXyXiL6QFKAKZ9/yxhzk1LqQQDvScIOMvOY+YkwDHtWNFaZtyDlpdaVmjcXIaK7mFmm0FwKg4NY81rDOc8YIw3WjpKKvOYU/geA1SmC7aX6bgBSZ8qJ2dCJ53lrarWatMDyIa9J4Nct31o9CYnjeK3v+7NxHEvLaeiEmW8Nw1CWlPzIaxJoezbRlZRCoXDB/Pz8K1OcUQya4J5bltTTduHoy+Xy+4noAdeI5ufnLyoUChfbHi26+nHFJZVrmcgrlUpyQPNz18HJ1sP3/aNxHP/Z1UY/cUmlWibylFJa9p2uATDz1pUrV06ePn266xvN1XYeOM/zLu91RpKVvG6H2XsBvAiAHFR37ccxczUMw61KKWkGXJdHwDnaeMoYs7aXPWfyukzZh3zfv3vhpcNmN1hIlAveq4lodRzHz2915JZAiro2R24STQXGGNMX8tqm7P5Go3HvxMSE1MCppXlSJ3fsLk8N7g8gMevErXPmSUHOzHuY+f4oip7KGkMQBNttbkNl9WOJT8w6Z/KaU9Y3xvzUcjBWakopaQ7INxyLKV82xtxuMwDnzLMxnlYnCIJBda67DW3aGCOfR1jJUJEnI17MMwzf9y+uVqsnrZjLsubZOnDRW6TTs3Vpl6Ghy7wW2QM8t/1THMc3RFF0LO0/emjJa07hft8YODgzM7N53759p9MS5/y2dXGUBdOHuyqt4RwyxrzBdWxDnXntQZVKpSy3pDpy1O0etQ2h5xR5rYAW3s8DsKb5rUd7Df0MMx8lIvk+7cxvZpabpv/zzRwz3xyG4UEbstp1zknyOgU6MjJy/rJlyy5j5njVqlVHd+3a1fFi5o4dO847derUx1okEtHXtNaJ35h08vl/Q17azBkbG3tpo9HYTkTbXafuC5a8FtnywTUzr0q7xztn3rZps2pQ+i/4zMtC9BJ5GdhbIm+JvAwMZIAuZd4SeRkYyABdyrwl8jIwkAH6X0lrBW4THmvNAAAAAElFTkSuQmCC){.pic
v-4f14edf8=""}
:::

[](http://nav.poetries.top){target="_blank" v-4f14edf8=""}

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABh1JREFUeF7lW02IHFUQruqegIqSg9nEvShCbl4SoxgQxEMImJiQS2IOMbo/Xd0uxmhQ8ORmvQhCMFnj7nT17JK4AYnxYMwfiEEFRTEaDwoePEQlEE1WNBh/Dtuv5A0zm5nJTHe//pkMzINmBrr+3tfvp6pePYQ+b9it/hPR0jAMBxBxWalUWiYiAyKyTOtHxHlEvLKwsDAvIvO2bV9h5qvdsK0wAIaHh++wbXsjIm7Qj4jcadIhRPxdRE7rJwzDU7Ozs3+Z8CelzRUAz/OWK6W2AsD62nNLUkNi6P4DgA/1Y1nWsXK5fDknuZALAOPj49alS5eeAwD93JuXcR3kXACAycHBwcmJiQmVVVdmAFzX3SEiuuMPZjXGkP8cIk76vn/EkK+JPDUArus+ICKvAsBjWQzIgfcMIr7i+/7XaWSlAoCItgDAIQBYmkZpATx6x3iamd83lW0MgOM4u/TQM1XUDXo9FYMgeNNElxEARPQBAGwyUXATaE8w8+akehMDQESSVGgv0DFzor4lIiKi8wCwuhc6ZmDDt8x8fxx9LABENAMAw3GCevT9LDOPRNkWCQARPQsARotKDwKxi5kPdrKrIwCe5z2slNLu52092CkTk/6xLGt9uVz+vB1TRwCI6HQPODkmHY2iPcPMGxIDUHNv5/LS3gtyEPHJdm7zDSOgFth8eRN8exOcvgGANSYMAHBucHBwbWsAdQMARPQ8ALxhKLwb5NcQcb+IHGDmeSL6HgDuM1T8AjPvb+RpAqAWz+uvX3RIa2K37qjudKXONDQ0NLBkyZI0OYELlmWtbcwnNAHguq4nItMm1hVFi4gnlVIHgiD4qFUHEb0GAC+n0Y2Iz/i+X67ztgJwVES2pRGcI89BpdRUpVL5oZNMIvo77faMiO/6vv/EDQCMjY3dHobhZRG5NcfOJBV1Uc/tUqk0Mz09/UcUk+M4Y4j4VlLBrXSI+K9t28unpqau6XeLI8DzvMeVUifSCk7J9xkiHvR9/2hSfiL6EQBWJqVvR2dZ1qZyuXyyCQDHcRgRnSyCDXiPKKVmKpXKJwY84DjOZkQ8bsLTjlZEgiAIqAkAIroCANU8fUFND7lJpdSRqPkdM/w/RsRHc7BvnpkHFgHQhxYA8GcOgtuJ0NtYYNv2XNz8jtJPRDq01Q5QLk0pdVelUvmtugaMjIystG1bz6082ylEnDOZ3zEAaNd8R14GhmH40MzMzFdVAEZHR9dalvVFHsIRcSYMQz3MjeZ3lO4Mjk9HsYi41ff996oA5LADXASAt7PM75ivn9rxiZD7IjPvqwLguu6QiMymGAE6Fz+XdX7H6SWiXwFgRRyd4ftJZt5dBYCIXgKA1w0E5Dq/Y1b+TI5PJ9kicjwIgi1pAdjGzMcMAEtNWlRCtgmAlFPgrIgcDoKgsMRJXo5PB/SvT4GMi6BOmR/WT95FDUSk3dWNqYdPNOP1RTCnbfAnDYJlWYfK5bL+n6nl7fi0GtO0DebsCOmDyvqI0KMjVSs6NmlyhAp0hecQ8bDv+2dNUKg5PnoUFZaSb3KFa1thkcHQMWZOnGghonEA2GsCmiFtczCkmYsecoi4LulIyCPmjwKkbTiccSdI8gHmmHlnHKHneY5SiuPosrxvmxDpUkpsDTNHLoxE9CkAPJKlg1G8HVNimsl13aKTolXno5OBRKT3/GqqqqjWMSlaA6DotPhVy7JWdfITiOgdANheVOe13Mi0eJcORvYy80RrJz3PW62USu03JAQt+mCkth0WfTSm9/dVrW6z4zj7EHFPwo6kJYs+GtNSu3Q4upuZFyvNao7PdwXE/I1AJTscra0FuvqzsCgPAM4z8+Lpruu6e0RkX9rPmoQv8fF4XVjRBRIisrMeShcV8zcAY1YgoRm7UCJzlpnXOY6zHRH16l9US1ciU1sQiy6S0vHBUwXG/Lob6YqkGqZC/5bJNYDQv4WSDSD0b6lsAwj9WyxdB6Gvy+UbRkL/Xpiog9DXV2YaPZa+vTTVCEJfX5trBKJvL062c+L78upsVDQzOjq6QkTuKZVKd+tfAKj/6jTVzwDwi/5dWFio/ur6naKio0a5sVdmumHEzdTxP1mh7F/I9VpaAAAAAElFTkSuQmCC){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item style="display:none;" v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABMZJREFUeF7tWk2IHFUQrhpmEcR4EFQwl+DBg4dAUAKKh4hiMCwJGiJGUDK786p7VzaIJhdFzB5UMAYxkMWuN+NGFxQEFY0QFUNyyEGIHjwoKIKelBgQBZVdmHklFXqWtt3d6Tfduw3b/WAPO1O/39SrqlfvIVR8YcX9hxqAOgIqjkC9BSoeAHUSLG0LtFqtG5vN5nsagb1e75H5+fkrZURjaQAYY6YR8ZQ6LSJPWmvnKgUAER0DgBdip2eZWf/f8FVaBNQA1BFQ8S3Qbrd3NRqN87rpnXP3djqdCxueAADK7QPa7fYd6nSn0/m6DOdVp3cSNMbsRsQ3AOAPRDwZRdF8WcarXiJ6GQAeFZGfFxcXxxcWFv72sccbACI6CgCvJJQcY+ZZH6VF0M7MzFyztLT0JgA8NpAnIjuttZd85HsDEATB7SLybVIJItooiiiL4unp6et6vd7dInIzAOifrsuIeBkALjLzP8PktFqtW8fGxt4CgHsStJeYeecw3vT33gCogDiBaehvSwg8wcxHVjOAiNoA8DAAPDjEyA8A4Cwzd1ajM8acR8Rdie8/BYAJZv51QwBQJcaY2wAgGhiCiKejKGqlDTDG7EXEwwBwn6dx50TkpLX24zQfEf2UAJ+ZOfCUvUw+UgQMuCcmJrY0m81ZEdkhIrPpUkZEzwLAi6Map3yI+G4URcv7PAb/EAAcQEQN+1wtdC4A1nKMiCSP42leZl4XW9dFaBAE74jIwSIBAIDnmPmlgmX69wHDDIj3/EfD6Eb5XkT2rZQTRpE14Ck8AojoixESXlYfzjHz/VmJs9AVCkBc6mwWxTlozFol0ldu0QC8H9d6Xzt86LVH2OPDsBZtYQAQ0bUA4NWHj+pEs9ncMjc399eo/Em+TAAYYw4hYrLr0yPshWTdJ6IHAOCzIozKIGM3M38+oAvDcIdzbt8KpXNojzAUgNTo6j86kud4Y8zjiPh2BuNzk4jIE9baBRUUhuE255x2hiutM8y8N9cWICIdXR9YSUhymmuMOYKIx3N7l0GAiBy11r6qpFNTU9v7/f43q9h3xVp7Uy4AlJmIIhHR3n95IeInzHxi8EFZAKj+IAhmnHN60EqvwFr7Q24AMvwoejgqZQtksW1DACgzCeYBYWgSzCp8U5dBDxCq2wjFyVKnPtVthWMQqnsYUgAqfxyO63J1ByKDhFmJkVj8yuN5RJwBgP/d8a/XUJSIujoGF5EPEbHFzH9mrVRpupH7AL0bQMTXEXF7LPQXZt6aVrBOY3F1+PpY1/f9fn+82+3+OAoIIwGQfN6SUPo0M7+2mhEFX4ycQsTppC7n3F2dTudLXxC8AQjDcNw5dyapyGdYWcTVWFxuFeynUg7f4ns75A2AMWYCEXUP6voNAPYz80Vf5IugJ6JnAODqsViXiOyx1p71ke0NQBiGW51zhxFR9/vxKIpWPIv7GJGHNgiCgyLyEAB8N8otkTcAeYxN82oi1c/Keh2iuksDQF+HNBqNr9QI59ydZb0SKQ2A+plc/Uyu4s/kKr8F4suWqy/MRKRlrT1dZIXJKqu0JDg5OXlDo9HQEZpWgf3dbvf3rEYXSVcaAEU6kUdWDUAe9DYDbx0Bm+FXzONDHQF50NsMvJWPgH8BZ+4JX3pL2ngAAAAASUVORK5CYII=){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABclJREFUaEO9WW2oFUUYft853nv/ZIQQpCUUlYYRYkURfWBYGZZCZijhD+M6M+utm2VQRsk11EpILK17d2eWFNKs6IOw0EyyBIs+oBT6QKUfBuq1/lRQ2jl335jLnsOec3fPzO4eXTg/zs7zPs/77Jmdeec9CCUvz/PujaJIKKXmlaQqFI6FouIgKaUiIo6IVwdB8FMZrqKxhQwIIa4FgNcBYDoRrdVaryqagIkTQqxWSq0uwpHbgJTSI6KhWOyvSqUyY2ho6Nci4ibG87yboyjappS6rAhHLgNCCPPUH0oIbVJKLS8iXI/hnA8holepVC4v8iCcDQgh3gOA+clkiWiG1vqHMgaEEH8DwHkAsEIptTEvl5MBIcQzALC2hXyXUmpOXsEknnN+ByJ+au4R0eda69vz8lkNCCEEAAStxIj4aBAEm/MKJvFSypeJqDEFGWM3+r7/TR7OtgaklIuJ6I00wnHjxl05ODh4NI9YEtvf33/+6dOnjyLihYn7Sikl83BmGpBS3kREX2aQ7VFKzbYJeZ43M4mp1WqjXxljVwDAJQAwkMLxOCIeHhkZ+ad1rFKpnGrdbzINCCHeBYD705IkovVa65U2A1LKPiJ6zYZzHN9frVYXbNmy5fckPtUA53wRIu7IImaMLfR9/x0X4fhFfRUAprrgMzCZy/UYA0KILgAwU+f6LEFEnBIEwRHXhPr6+iZXq9VXEPE+15gYd4ox9pTv+1szc2kdEEKYqfGCRahbKVXNmQy0WxRSuHYi4qogCA620xnzC3DOjyCieckyryiKLgrDcDivAYM3dU/Gy5uke861NmoyIIS4CwA+sSUWRdG0MAx/tuHSxpcuXTqTMbbPErvTtTxvMsA534SI/bbEGGO3+L5/wIZLG+ec9yGibWU6rpS62IW/1YB1+hhSIlqstd7uItCK4ZzvQ8Sm/SGNh4gWaK1N/dX2ahgQQlwDAIdsAfG48xxN8kkpbyOiLxL3dhPRmlqtdqSrq6s3uXgQ0Q6t9YO2fBoGpJRziOhjW4AZR8TtQRAsdsG2GEjWPuuUUs8mx4UQJuEXAWAyAPynlOqxaSQNLCSit2wB8fghpdR0R2wDJqU8RkSniGid1vqDtHjP8y6Nosgs44tcplHDAOfcnG2Va1J5iznO+RREfAIAzJM/ZtMRQjyCiLODIJjbDpv8BVYQ0QYbcX28E+W0q5aTAccNJslV+kDTUQNSyl4iCvOQMsbm+r7/UZ6YTmOT78BsRNydU8B5x8zJ6wxPvgPTiOhH58gYSETzs1aUvFxF8A0D5oh35syZPwuQHAaAO11WlgLc1pDWYs4UaFdZo1oArrtmXl4XfJMBKeXzRPS0S2AKplB5UVCrEdZkoLe394ZKpfJ1CdJzbiLtSPkdAFxX1AQR3a21tp4pivK3xqUZcDkxtdUnojla612dStJpJ66DlixZckF3d/dXRV7mpNC5KjVS2ypCCNMd88s+QSIyrZeXtNbfluXKim/X2PoMAHI3W1OEaqZIrNVqG1qbUp0wlWmAcz4PET/shEjMYfpIG5RSYxrFZTTaNneFEA8DgOmqdfLaQ0TbEHGvUupEWWKX9vp6AHiyrNCY5Q/xXyLaS0T7ieggY+yAUmpMQ9emazVgCIQQv5TsbdryqI9/DwC/AcAf8cfcn2A+RDQBEScBwEQAGK+UGs3dyUBs4ngc7JrMWcMR0UqttZkZ7gZiE+bwcs9Zy8xOfDyKouVhGJrW/+jl/AvUAzjnaxCxqR1i1y2PQMStIyMjG8MwbOpd5TZgUomX2Mc6tE/Y3O0kok1a671pwEIG6kTxjm2M5D5D2LImogOMsc1BELzdDlvKgCGOa6fliDiLiG61JWYZN/8Zvw8A5j+4N124ShtIiixbtmxqrVabBQAPuDRw67HmRIeIpm4yiefaCzpqIGlmYGCge3h4eBIRTYyiaBIiTkTE8QBwMoqi0U9PT8+JwcHBky5POgvzPy1yQE/0lv27AAAAAElFTkSuQmCC){.pic
v-4f14edf8=""}
:::

[](/docs/base/high-frequency.html){.el-tooltip v-4f14edf8=""}

::: {.item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABOxJREFUeF7tmF1oHFUUx89ZF0GXPsSHqhU/HkRstWAtRhAfBJXSWmxBUqWC6Jp77yam1YjUr1Irgl9FttYac89M0gcVP+JDP9AKCq1IUbHti7YaFBGtqIgGlVCI2XtkYAKbuLtnZrKTZN1Z2Kf7v+f+z2/OuXfuILT5D9s8f8gAZBXQ5gSyFmjzAsg2wawFshZocwJZC7R5AWSnQNYCWQu0OYH/dQsYY5Yx8wZmPu553v5az7omAK31cwCwJZjAzEeYeavv+4dbqViqcwh8I+IHzNxNRD9U5/EfAEqpVxCxNDNZZu70PO/zVoCgtbYAoGt4fZeI1tYF0Nvbe+Hk5OQ0QtVi59x5vu//upAhGGO2MvNT9Twi4hXW2pNT49MqoLu7e2UulzsqJHgmEf2zECEope5GxD2NvDUE0NPT01GpVP4QkvuNiBYvNADGmBuZ+UPB1wkiurLhHtCgf6rnHSeilQsFglLqMkT8BADOETxtJ6InJQBnM/NeRLy5UTBm3ud53vr5htDf33/W+Pj4IQC4Vij9AWvtfTM1NY/BcDPcBwArhAR3E9Gm+YSgtX4bALoEDyNEtCHye0AgVEpdhYgBhIuE4FuIaMd8QFBKvYCIDwprfwQA64joz1gAQgg3IeJeACgI5bXRWvvGXELQWj8AAGVhzdFKpbJ2aGjo27rHomTaGHM7M78p6Zh5jed5ByVdM8aVUrch4jtSLES8zlobbI51f5HuAlrrYPPY3YwFpRjSeKlU6nTOfSbpEHG9tTZo4Ya/SADCdtiGiNOOkFqRnXPLfN//Slo4yXixWFySz+d/ijBXEZEfQRfvi5DW+kUA2CwEDjabpUT0cxQDcTRKqW8Q8VJhzuNE9HTUuJErYCqg1vp1ANgoLPBloVDoLJfLp6MakXRa6/cAYLWg20lE/VKs6vHYAILJxpj3mXmVsNBBIloTx0w9rVJqFyJK7xv7iWhd3PUSAQj3hKOIKL0O7yGiYlxT1XpjzCZm3iXEGC0UCiuSVFxiAF1dXWd0dHQE5+slgrkyEUkvKzVDKKVWI2JQ+tLv4pkfOqQJU+OJAQQB+vr6lkxMTHwNAIuEBbcRUd07eq254eesE1IiiHiNtVa6wtcNMysAQVSt9dUAcCyC0c3W2pckXTBeLBYX5fP5vyRtM16+Zg0g3A8ilSoz3+V53qtSYlrr36WrLTPf63nesBRLGm8KgPBkuIeZRUOIeKu19kA9Y1rrT6WrLQA8T0QPS8lFGW8agLAdHgGAZ4SFTzvnVvm+//FMnTHmNWa+U5if6LirF7OpAMJ22ImI9wtJ/AgAtxDRF1M6rfV2AHhCmDdKRJdHebJRNU0HEFZCcDW+QzDxPTO/nMvlTgaf3CMkD2NjY/mRkZFK1OSi6FIBEFbCIUS8IYqJKJp8Pn/+wMDAL1G0cTSpAQgrIfj+vjSOoVraXC53/eDg4JHZxqk1P1UAIQTxSGuUWLOOuznbBGstpLUOSvfcBE+wacfdvAIIFjfG7GDmh2JAeJaIHo2hTyRNvQWqXWmtDQAMNnKKiN8BwGPW2rcSZRRz0pwCCLyVSqXFzLw8+APAckS8wDl3ChFPOecOO+eODQ8P/x0zj8TyOQeQ2GlKEzMAKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaNtXwL8uSqVQauCBGgAAAABJRU5ErkJggg==){.pic
style="transform:rotate(90deg);" v-4f14edf8=""}
:::

[](/docs/base/comprehensive.html){.el-tooltip v-4f14edf8=""}

::: {.item style="transform:rotate(270deg);" v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABOxJREFUeF7tmF1oHFUUx89ZF0GXPsSHqhU/HkRstWAtRhAfBJXSWmxBUqWC6Jp77yam1YjUr1Irgl9FttYac89M0gcVP+JDP9AKCq1IUbHti7YaFBGtqIgGlVCI2XtkYAKbuLtnZrKTZN1Z2Kf7v+f+z2/OuXfuILT5D9s8f8gAZBXQ5gSyFmjzAsg2wawFshZocwJZC7R5AWSnQNYCWQu0OYH/dQsYY5Yx8wZmPu553v5az7omAK31cwCwJZjAzEeYeavv+4dbqViqcwh8I+IHzNxNRD9U5/EfAEqpVxCxNDNZZu70PO/zVoCgtbYAoGt4fZeI1tYF0Nvbe+Hk5OQ0QtVi59x5vu//upAhGGO2MvNT9Twi4hXW2pNT49MqoLu7e2UulzsqJHgmEf2zECEope5GxD2NvDUE0NPT01GpVP4QkvuNiBYvNADGmBuZ+UPB1wkiurLhHtCgf6rnHSeilQsFglLqMkT8BADOETxtJ6InJQBnM/NeRLy5UTBm3ud53vr5htDf33/W+Pj4IQC4Vij9AWvtfTM1NY/BcDPcBwArhAR3E9Gm+YSgtX4bALoEDyNEtCHye0AgVEpdhYgBhIuE4FuIaMd8QFBKvYCIDwprfwQA64joz1gAQgg3IeJeACgI5bXRWvvGXELQWj8AAGVhzdFKpbJ2aGjo27rHomTaGHM7M78p6Zh5jed5ByVdM8aVUrch4jtSLES8zlobbI51f5HuAlrrYPPY3YwFpRjSeKlU6nTOfSbpEHG9tTZo4Ya/SADCdtiGiNOOkFqRnXPLfN//Slo4yXixWFySz+d/ijBXEZEfQRfvi5DW+kUA2CwEDjabpUT0cxQDcTRKqW8Q8VJhzuNE9HTUuJErYCqg1vp1ANgoLPBloVDoLJfLp6MakXRa6/cAYLWg20lE/VKs6vHYAILJxpj3mXmVsNBBIloTx0w9rVJqFyJK7xv7iWhd3PUSAQj3hKOIKL0O7yGiYlxT1XpjzCZm3iXEGC0UCiuSVFxiAF1dXWd0dHQE5+slgrkyEUkvKzVDKKVWI2JQ+tLv4pkfOqQJU+OJAQQB+vr6lkxMTHwNAIuEBbcRUd07eq254eesE1IiiHiNtVa6wtcNMysAQVSt9dUAcCyC0c3W2pckXTBeLBYX5fP5vyRtM16+Zg0g3A8ilSoz3+V53qtSYlrr36WrLTPf63nesBRLGm8KgPBkuIeZRUOIeKu19kA9Y1rrT6WrLQA8T0QPS8lFGW8agLAdHgGAZ4SFTzvnVvm+//FMnTHmNWa+U5if6LirF7OpAMJ22ImI9wtJ/AgAtxDRF1M6rfV2AHhCmDdKRJdHebJRNU0HEFZCcDW+QzDxPTO/nMvlTgaf3CMkD2NjY/mRkZFK1OSi6FIBEFbCIUS8IYqJKJp8Pn/+wMDAL1G0cTSpAQgrIfj+vjSOoVraXC53/eDg4JHZxqk1P1UAIQTxSGuUWLOOuznbBGstpLUOSvfcBE+wacfdvAIIFjfG7GDmh2JAeJaIHo2hTyRNvQWqXWmtDQAMNnKKiN8BwGPW2rcSZRRz0pwCCLyVSqXFzLw8+APAckS8wDl3ChFPOecOO+eODQ8P/x0zj8TyOQeQ2GlKEzMAKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaNtXwL8uSqVQauCBGgAAAABJRU5ErkJggg==){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item style="display:none;" v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAK9JREFUaEPtmEEOgCAMBOGzPIrP6s2o0UPpQgXHe7cwUwIxp8m/PPn6ExuINoiBzxoopWzRizv3r7U+TsvrCLEBsT4MiIGa4/5nwIwoqICLLAj80RYDGHASYIScAN3l6xrgNeoejmvA/95CjBAj5DwDYoDd4ta9B7ohEwdjQAzUHIcBMzJxAQbEQM1x/Nw1I2ss4DndCE5WhgEZysYgs4HGPsPLuMiGI781xAAGnAR2B4xIMbUdZB4AAAAASUVORK5CYII=){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAwCAYAAABHYrdbAAAAAXNSR0IArs4c6QAAAflJREFUaEPtmrFLwkEUx7/vcIugf6IIgigKIqqxttqKQIoGf6dLW+211i56CkIOQU6BW2MRREM0FLQFjQ1JrXIvTvsFhsYVxSm+m36Cvvfuw+f3/Hk+AgCtdYqZt4lo3L3uw/UIoJpIJA6y2ewTRVG0TkTHfQii3ZavACyQ1vocwLxAaRKw1k47KK8ABgVKkwAzLzooNwAmBEorlFUAJwKlScAYQ+QuUqnUlFIqycyT/QiHiGoAbo0xe27/DSiyWgkIlDZGCBSB4tcoxBQxRUzxIyCm+HGSniKmiCl+BMQUP07SU74zJYqiJBEN+7H8l3fVrLV3xWLx7F+i/yBowxSttTtPcecq3bD245/woYqhdDp9yMw7oQpol1cptZzL5aqhanLHkQ8ARkIV0CFvxRizFqomB+UFwFCoAjrkLRtjNkPV5KB0Uz9pcGDmzUKhUA4G5aPRHgHYCFXEl7zhG21ckNbaffuMBQTzppR6CNlg473Lw5s85vvdB2KKmCKm+BEQU/w4SU8RU8QUPwJiih8n6SliipjiR6CTKVrrGWbeAjD660g9/EGl1KO19rper1dKpdIzZTKZOWvtRQ/v6S9L/xwuPgWw8peRezlWPFzcjWe0wbjKcHEb9DEUGS5uhTMQ/0O4BMAN1s4G8zZs4hozXyqldvP5/P079iyQZczayqEAAAAASUVORK5CYII=){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABOxJREFUeF7tmF1oHFUUx89ZF0GXPsSHqhU/HkRstWAtRhAfBJXSWmxBUqWC6Jp77yam1YjUr1Irgl9FttYac89M0gcVP+JDP9AKCq1IUbHti7YaFBGtqIgGlVCI2XtkYAKbuLtnZrKTZN1Z2Kf7v+f+z2/OuXfuILT5D9s8f8gAZBXQ5gSyFmjzAsg2wawFshZocwJZC7R5AWSnQNYCWQu0OYH/dQsYY5Yx8wZmPu553v5az7omAK31cwCwJZjAzEeYeavv+4dbqViqcwh8I+IHzNxNRD9U5/EfAEqpVxCxNDNZZu70PO/zVoCgtbYAoGt4fZeI1tYF0Nvbe+Hk5OQ0QtVi59x5vu//upAhGGO2MvNT9Twi4hXW2pNT49MqoLu7e2UulzsqJHgmEf2zECEope5GxD2NvDUE0NPT01GpVP4QkvuNiBYvNADGmBuZ+UPB1wkiurLhHtCgf6rnHSeilQsFglLqMkT8BADOETxtJ6InJQBnM/NeRLy5UTBm3ud53vr5htDf33/W+Pj4IQC4Vij9AWvtfTM1NY/BcDPcBwArhAR3E9Gm+YSgtX4bALoEDyNEtCHye0AgVEpdhYgBhIuE4FuIaMd8QFBKvYCIDwprfwQA64joz1gAQgg3IeJeACgI5bXRWvvGXELQWj8AAGVhzdFKpbJ2aGjo27rHomTaGHM7M78p6Zh5jed5ByVdM8aVUrch4jtSLES8zlobbI51f5HuAlrrYPPY3YwFpRjSeKlU6nTOfSbpEHG9tTZo4Ya/SADCdtiGiNOOkFqRnXPLfN//Slo4yXixWFySz+d/ijBXEZEfQRfvi5DW+kUA2CwEDjabpUT0cxQDcTRKqW8Q8VJhzuNE9HTUuJErYCqg1vp1ANgoLPBloVDoLJfLp6MakXRa6/cAYLWg20lE/VKs6vHYAILJxpj3mXmVsNBBIloTx0w9rVJqFyJK7xv7iWhd3PUSAQj3hKOIKL0O7yGiYlxT1XpjzCZm3iXEGC0UCiuSVFxiAF1dXWd0dHQE5+slgrkyEUkvKzVDKKVWI2JQ+tLv4pkfOqQJU+OJAQQB+vr6lkxMTHwNAIuEBbcRUd07eq254eesE1IiiHiNtVa6wtcNMysAQVSt9dUAcCyC0c3W2pckXTBeLBYX5fP5vyRtM16+Zg0g3A8ilSoz3+V53qtSYlrr36WrLTPf63nesBRLGm8KgPBkuIeZRUOIeKu19kA9Y1rrT6WrLQA8T0QPS8lFGW8agLAdHgGAZ4SFTzvnVvm+//FMnTHmNWa+U5if6LirF7OpAMJ22ImI9wtJ/AgAtxDRF1M6rfV2AHhCmDdKRJdHebJRNU0HEFZCcDW+QzDxPTO/nMvlTgaf3CMkD2NjY/mRkZFK1OSi6FIBEFbCIUS8IYqJKJp8Pn/+wMDAL1G0cTSpAQgrIfj+vjSOoVraXC53/eDg4JHZxqk1P1UAIQTxSGuUWLOOuznbBGstpLUOSvfcBE+wacfdvAIIFjfG7GDmh2JAeJaIHo2hTyRNvQWqXWmtDQAMNnKKiN8BwGPW2rcSZRRz0pwCCLyVSqXFzLw8+APAckS8wDl3ChFPOecOO+eODQ8P/x0zj8TyOQeQ2GlKEzMAKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaNtXwL8uSqVQauCBGgAAAABJRU5ErkJggg==){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item style="display:none;" v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABRNJREFUeF7tWWtoHFUUPmcGSWJQKAgVadWgqEWKBSEqBmp9FqNBaxGxCTRm50x2NSAtVHyAFh8/rBhssDv33NWkxBcUIy3aCtK0xQcWRRQUEUGioCAWRbHkuXNkJEqS7s6dzc5Ot+zcv/c73/nud899zSA0eMMGHz+kBqQV0OAOpEugwQsg3QTTJZAugQZ3IF0CDV4A6SmQLoF0CTS4A6d1CWQymVW2ba8WkT9mZmYmRkZGppKej0QNGBgYOHd6enqbiKxHxBtKDHZMRMa01q8nZURiBjiOczciPg0AV5oGh4jvikgvM58wYavtT8SAvr6+dtu2j1codhoR71dKjVUYVxG85gZkMpmrLcv6vCJVi8E7mHlXFfGhoTU1oK+v7yLbtieqFY+InUqpg9XylIqvmQFEdDYAnIxLtGVZbZ7nVW3mUj21NOAvADgnLgMCnqampuahoaHpODlrYgAR/QgAFxqE7vR9/2ihUDga4IjoKQB40hAzwcxtdW0AEX0JAFeFiRSRl7TWDy/FENGrANBriD2ote6My4RYK4CIxgFgg0HcXmbeWg7juu5hEbnRwLGLmXfEYUJsBhDR2wCwyTB7+7XWd4Vhcrnc6rm5uSMAcImBq1drPVKtCbEYQEQqWMYGMccmJyc7R0dHjScDEXUAQFBNZ4VxIuLNSqnD1ZhQtQFE9CwAPGYQ8a1lWbd4nvdzVLGO42xBxNdMeMuy1nqe97UJV66/KgOIKNjIBg3J/xaRa7XW31Qq0nXdR0XkOUPcydnZ2bbh4eHfKuUP8Ms2wHXdbhEZNSW1LKvD87yPTbhy/UTkAYBriP+MmduXk2NZBvT399/m+/77ERLewczvRcCFQojoEABsNOwHI0qp0CO0VHzFBsw/bo4BQGuYIMuyuj3Pi+Vdn8lkViLiEURcYzBzJzMHF6rIrSID5h83HwHAKkOGh5j55cgqIgD7+/vbfd8PToZQ4wEgx8z5CJT/QiIbMP+4+RQA1hrIn2Dm4GSIvbmuu1lE9pmIRWST1vodE65SA4I7+3rDOtyjlHowSuLlYohoOwC8YIoXkeu11p+YcJEqgIgCN0NvcMFnLKXUnaaEcfQ7jrMbEQcMXBO2bd+Uz+d/CJ00kyAiegUAHjDgvmLmdSauOPuJaD8AdIVxisj41NRUV9jtM7QCiCgotaDkwtrvTU1NF8T9TjeZlc1mVxSLxWBTNBn/BjNvKcdX1gAiehwAnjEJ8X3//EKh8KsJV4t+x3HWIWJgwgoD/yAzbyuFKWkAEWUBYI9JtG3bV+Tz+e9MuFr2O47ThYjBcjC1R5j5+aWgUwxwHOc+RHzTxOb7/nWFQiE4Fk97c113QER2RxCylZn3LsSVMiC4cZX6a7Mw7l5mNp7HEQTFBom4X52wbbtjYdUuMmD+Y8RPYaoQcbtS6sXYlMdI5DjOPkTcbKBcdF1easClc3Nz35cjKPctL8YxVEXV09PT2tzcPI6IYS/D8gYE2YnoAACUutCMMfM9VSlMIDiXy62Z/6S2slQ6Eele+PP1lD2AiK4BgLcA4OL/CBDxA6XUrQnojyWF67ob579VnLeE8Hhra+uGwcHByf/HVipjUEotLS23B39yReQLrXVQFWdUy2azlxeLxeAGe5mI/GLb9iHf9z9k5j9DT4EzapQxiI30GIohT91SpAbU7dQkJCytgISMrts0aQXU7dQkJCytgISMrts0aQXU7dQkJCytgISMrts0/wBjzqdQgd2RNAAAAABJRU5ErkJggg==){.pic
v-4f14edf8=""}
:::
:::
:::
:::
:::

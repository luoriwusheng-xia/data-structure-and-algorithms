
### [\#](#_2-创建对象有几种方法){.header-anchor} 2 创建对象有几种方法 {#_2-创建对象有几种方法}

#### [\#](#_2-1-方式一-字面量){.header-anchor} 2.1 方式一：字面量 {#_2-1-方式一-字面量}

::: {.language-javascript .extra-class}
``` language-javascript

                                var
                                obj11 =
                                {
                                name
                                :
                                'smyh'
                                }
                                ;
                                var
                                obj12 =
                                new
                                Object
                                (
                                name:

                                    `
                                    smyh
                                    `

                                )
                                ;
                                //内置对象（内置的构造函数）


```
:::

> 上面的两种写法，效果是一样的。因为，第一种写法，`obj11` 会指向`Object`
> 。

-   第一种写法是：字面量的方式。
-   第二种写法是：内置的构造函数

#### [\#](#_2-2-方式二-通过构造函数){.header-anchor} 2.2 方式二：通过构造函数 {#_2-2-方式二-通过构造函数}

::: {.language-javascript .extra-class}
``` language-javascript

                                var
                                M
                                =
                                function
                                (
                                name
                                )
                                {
                                this
                                .
                                name =
                                name;
                                }
                                var
                                obj3 =
                                new
                                M
                                (
                                'smyhvae'
                                )
                                ;


```
:::

#### [\#](#_2-3-方法三-object-create){.header-anchor} 2.3 方法三：Object.create {#_2-3-方法三-object-create}

::: {.language-javascript .extra-class}
``` language-javascript

                                var
                                p =
                                {
                                name
                                :
                                'poetry'
                                }
                                ;
                                var
                                obj3 =
                                Object.
                                create
                                (
                                p)
                                ;
                                //此方法创建的对象，是用原型链连接的


```
:::

> 第三种方法，很少有人能说出来。这种方式里，`obj3` 是实例，`p`
> 是`obj3的` 原型（`name` 是p原型里的属性），构造函数是`Object` 。

### [\#](#_3-原型、构造函数、实例-以及原型链){.header-anchor} 3 原型、构造函数、实例，以及原型链 {#_3-原型、构造函数、实例-以及原型链}

> PS：任何一个函数，如果在前面加了`new` ，那就是构造函数。

#### [\#](#_3-1-原型、构造函数、实例三者之间的关系){.header-anchor} 3.1 原型、构造函数、实例三者之间的关系 {#_3-1-原型、构造函数、实例三者之间的关系}

1.  构造函数通过 `new` 生成实例
2.  构造函数也是函数，构造函数的`prototype`
    指向原型。（所有的函数有`prototype` 属性，但实例没有 `prototype`
    属性）
3.  原型对象中有 `constructor` ，指向该原型的构造函数。

> 上面的三行，代码演示：

::: {.language-js .extra-class}
``` language-js

                                var
                                Foo
                                =
                                function
                                (
                                name
                                )
                                {
                                this
                                .
                                name =
                                name;
                                }
                                var
                                fn =
                                new
                                Foo
                                (
                                'smyhvae'
                                )
                                ;


```
:::

> 上面的代码中，`Foo.prototype.constructor === Foo` 的结果是`true` ：

4.  实例的`__proto__`
    指向原型。也就是说，`Foo.__proto__ === M.prototype` 。

> 声明：所有的**引用类型** （数组、对象、函数）都有`__proto__`
> 这个属性。

`Foo.__proto__ === Function.prototype` 的结果为true，说明`Foo`
这个普通的函数，是`Function` 构造函数的一个实例。

#### [\#](#_3-2-原型链){.header-anchor} 3.2 原型链 {#_3-2-原型链}

**原型链的基本原理** ：任何一个**实例**
，通过原型链，找到它上面的**原型**
，该原型对象中的方法和属性，可以被所有的原型实例共享。

> `Object` 是原型链的顶端。

-   原型可以起到继承的作用。原型里的方法都可以被不同的实例共享：

::: {.language-js .extra-class}
``` language-js

                                //给Foo的原型添加 say 函数
                                Foo
                                .
                                prototype.
                                say
                                =
                                function
                                (
                                )
                                {
                                console.
                                log
                                (
                                ''
                                )
                                ;
                                }


```
:::

**原型链的关键**
：在访问一个实例的时候，如果实例本身没找到此方法或属性，就往原型上找。如果还是找不到，继续往上一级的原型上找。

#### [\#](#_3-3-instanceof的原理){.header-anchor} 3.3 `instanceof` 的原理 {#_3-3-instanceof的原理}

-   `instanceof` 的**作用** ：用于判断**实例** 属于哪个**构造函数** 。
-   `instanceof` 的**原理** ：判断实例对象的`__proto__`
    属性，和构造函数的`prototype`
    属性，是否为同一个引用（是否指向同一个地址）。

> -   **注意1** ：虽然说，实例是由构造函数 new
>     出来的，但是实例的`__proto__` 属性引用的是构造函数的`prototype`
>     。也就是说，实例的`__proto__` 属性与构造函数本身无关。
> -   **注意2**
>     ：在原型链上，原型的上面可能还会有原型，以此类推往上走，继续找`__proto__`
>     属性。这条链上如果能找到， instanceof 的返回结果也是 true。

比如说：

-   `foo instance of Foo`
    的结果为true，因为`foo.__proto__ === M.prototype` 为`true` 。
-   **`foo instance of Objecet` 的结果也为true**
    ，为`Foo.prototype.__proto__ === Object.prototype` 为`true` 。

> 但我们不能轻易的说：`foo` 一定是 由`Object`
> 创建的实例\`。这句话是错误的。我们来看下一个问题就明白了。

#### [\#](#_3-4-分析一个问题){.header-anchor} 3.4 分析一个问题 {#_3-4-分析一个问题}

**问题：**已知A继承了B，B继承了C。怎么判断 a 是由A** 直接生成**
的实例，还是B直接生成的实例呢？还是C直接生成的实例呢？

> 分析：这就要用到原型的`constructor` 属性了。

-   `foo.__proto__.constructor === M` 的结果为`true` ，但是
    `foo.__proto__.constructor === Object` 的结果为`false` 。
-   所以，用 `consturctor` 判断就比用 `instanceof` 判断，更为严谨。

### [\#](#_4-new-运算符){.header-anchor} 4 new 运算符 {#_4-new-运算符}

> 当`new Foo()` 时发生了什么：

-   创建一个**新的空对象实例** 。
-   将此空对象的隐式原型指向其构造函数的显示原型。
-   执行构造函数（传入相应的参数，如果没有参数就不用传），同时 `this`
    指向这个新实例。
-   如果返回值是一个新对象，那么直接返回该对象；如果无返回值或者返回一个非对象值，那么就将步骤（1）创建的对象返回。

## [\#](#二、面向对象){.header-anchor} 二、面向对象 {#二、面向对象}

### [\#](#_1-前言){.header-anchor} 1 前言 {#_1-前言}

> 类与实例：

-   类的声明
-   生成实例

**类与继承：**

-   如何实现继承：继承的本质就是原型链
-   继承的几种方式

### [\#](#_2-类的定义、实例化){.header-anchor} 2 类的定义、实例化 {#_2-类的定义、实例化}

#### [\#](#_2-1-类的定义-类的声明){.header-anchor} 2.1 类的定义/类的声明 {#_2-1-类的定义-类的声明}

**方式一** ：用构造函数模拟类（传统写法）

::: {.language-js .extra-class}
``` language-js

                                function
                                Animal1
                                (
                                )
                                {
                                this
                                .
                                name =
                                'smyhvae'
                                ;
                                //通过this，表明这是一个构造函数
                                }


```
:::

**方式二** ：用 `class` 声明（`ES6` 的写法）

::: {.language-js .extra-class}
``` language-js

                                class
                                Animal2
                                {
                                constructor
                                (
                                )
                                {
                                //可以在构造函数里写属性
                                this
                                .
                                name =
                                name;
                                }
                                }


```
:::

控制台的效果：

#### [\#](#_2-2-实例化){.header-anchor} 2.2 实例化 {#_2-2-实例化}

类的实例化很简单，直接 `new` 出来即可。

::: {.language-js .extra-class}
``` language-js

                                console.
                                log
                                (
                                new
                                Animal1
                                (
                                )
                                ,
                                new
                                Animal2
                                (
                                )
                                )
                                ;
                                //实例化。如果括号里没有参数，则括号可以省略


```
:::

### [\#](#_3-继承的几种方式){.header-anchor} 3 继承的几种方式 {#_3-继承的几种方式}

> 继承的本质就是原型链。

**继承的方式有几种？每种形式的优缺点是**
？这些问题必问的。其实就是考察你对原型链的掌握程度。

#### [\#](#_3-1-方式一-借助构造函数){.header-anchor} 3.1 方式一：借助构造函数 {#_3-1-方式一-借助构造函数}

::: {.language-javascript .extra-class}
``` language-javascript

                                function
                                Parent1
                                (
                                )
                                {
                                this
                                .
                                name =
                                'parent1 的属性'
                                ;
                                }
                                function
                                Child1
                                (
                                )
                                {
                                Parent1
                                .
                                call
                                (
                                this
                                )
                                ;
                                //【重要】此处用 call 或 apply 都行：改变 this 的指向
                                this
                                .
                                type =
                                'child1 的属性'
                                ;
                                }
                                console.
                                log
                                (
                                new
                                Child1
                                )
                                ;


```
:::

> 【重要】上方代码中，最重要的那行代码：在子类的构造函数里写了`Parent1.call(this);`
> ，意思是：**让Parent的构造函数在child的构造函数中执行**
> 。发生的变化是：**改变this的指向** ，parent的实例
> \--\>改为指向child的实例。导致
> parent的实例的属性挂在到了child的实例上，这就实现了继承。

打印结果：

> 上方结果表明：`child` 先有了 `parent`
> 实例的属性（继承得以实现），再有了`child` 实例的属性。

**分析** ：

> 这种方式，虽然改变了 `this` 的指向，但是， **Child1 无法继承 `Parent1`
> 的原型** 。也就是说，如果我给 `Parent1` 的原型增加一个方法：

::: {.language-javascript .extra-class}
``` language-javascript

                                Parent1
                                .
                                prototype.
                                say
                                =
                                function
                                (
                                )
                                {
                                }
                                ;


```
:::

> 上面这个方法是无法被 `Child1` 继承的。如下：

#### [\#](#_3-2-方法二-通过原型链实现继承){.header-anchor} 3.2 方法二：通过原型链实现继承 {#_3-2-方法二-通过原型链实现继承}

::: {.language-javascript .extra-class}
``` language-javascript

                                /*
通过原型链实现继承
*/
                                function
                                Parent
                                (
                                )
                                {
                                this
                                .
                                name =
                                'Parent 的属性'
                                ;
                                }
                                function
                                Child
                                (
                                )
                                {
                                this
                                .
                                type =
                                'Child 的属性'
                                ;
                                }
                                Child
                                .
                                prototype =
                                new
                                Parent
                                (
                                )
                                ;
                                //【重要】
                                console.
                                log
                                (
                                new
                                Child
                                (
                                )
                                )
                                ;


```
:::

打印结果：

> 【重要】上方代码中，最重要的那行：每个函数都有`prototype`
> 属性，于是，构造函数也有这个属性，这个属性是一个对象。现在，
> **我们把`Parent` 的实例赋值给了`Child` 的`prototye`**
> ，从而实现**继承** 。此时，`Child` 构造函数、`Parent` 的实例、`Child`
> 的实例构成一个三角关系。于是：

-   `new Child.__proto__ === new Parent()` 的结果为`true`

**分析：**

-   这种继承方式，**Child 可以继承 Parent 的原型** ，但有个缺点：

> 缺点是：**如果修改
> child1实例的name属性，child2实例中的name属性也会跟着改变** 。

如下：

> 上面的代码中， `child1` 修改了`arr` 属性，却发现，`child2` 的`arr`
> 属性也跟着改变了。这显然不太好，在业务中，两个子模块应该隔离才对。如果改了一个对象，另一个对象却发生了改变，就不太好。

> 造成这种缺点的原因是：`child1` 和`child2`
> 共用原型。即：`chi1d1.__proto__ === child2__proto__` 是严格相同。而
> arr方法是在 Parent 的实例上（即 Child实例的原型）的。

#### [\#](#_3-3-方式三-组合的方式-构造函数-原型链){.header-anchor} 3.3 方式三：组合的方式：构造函数 + 原型链 {#_3-3-方式三-组合的方式-构造函数-原型链}

就是把上面的两种方式组合起来：

::: {.language-js .extra-class}
``` language-js

                                /*
组合方式实现继承：构造函数、原型链
*/
                                function
                                Parent3
                                (
                                )
                                {
                                this
                                .
                                name =
                                'Parent 的属性'
                                ;
                                this
                                .
                                arr =
                                [
                                1
                                ,
                                2
                                ,
                                3
                                ]
                                ;
                                }
                                function
                                Child3
                                (
                                )
                                {
                                Parent3
                                .
                                call
                                (
                                this
                                )
                                ;
                                //【重要1】执行 parent方法
                                this
                                .
                                type =
                                'Child 的属性'
                                ;
                                }
                                Child3
                                .
                                prototype =
                                new
                                Parent3
                                (
                                )
                                ;
                                //【重要2】第二次执行parent方法
                                var
                                child =
                                new
                                Child3
                                (
                                )
                                ;


```
:::

-   这种方式，能解决之前两种方式的问题：既可以继承父类原型的内容，也不会造成原型里属性的修改。
-   这种方式的缺点是：让父亲`Parent` 的构造方法执行了两次。
-   `ES6` 中的继承方式，一带而过即可，重点是要掌握`ES5` 中的继承。

## [\#](#三、dom事件总结){.header-anchor} 三、DOM事件总结 {#三、dom事件总结}

**知识点主要包括以下几个方面：**

-   基本概念：`DOM` 事件的级别

> 面试不会直接问你，DOM有几个级别。但会在题目中体现："请用`DOM2`
> \...."。

-   `DOM` 事件模型、`DOM` 事件流

> 面试官如果问你"**DOM事件模型**
> "，你不一定知道怎么回事。其实说的就是**捕获和冒泡** 。

**DOM事件流** ，指的是事件传递的**三个阶段** 。

-   描述`DOM` 事件捕获的具体流程

> 讲的是事件的传递顺序。参数为`false` （默认）、参数为`true`
> ，各自代表事件在什么阶段触发。

能回答出来的人，寥寥无几。也许有些人可以说出一大半，但是一字不落的人，极少。

-   `Event` 对象的常见应用（`Event` 的常用`api` 方法）

> `DOM`
> 事件的知识点，一方面包括事件的流程；另一方面就是：怎么去注册事件，也就是监听用户的交互行为。第三点：在响应时，`Event`
> 对象是非常重要的。

**自定义事件（非常重要）**

> 一般人可以讲出事件和注册事件，但是如果让你讲**自定义事件**
> ，能知道的人，就更少了。

**DOM事件的级别**

> `DOM` 事件的级别，准确来说，是**DOM标准** 定义的级别。包括：

**DOM0的写法：**

::: {.language-javascript .extra-class}
``` language-javascript

                                element.
                                onclick
                                =
                                function
                                (
                                )
                                {
                                }


```
:::

> 上面的代码是在 `js` 中的写法；如果要在`html` 中写，写法是：在`onclick`
> 属性中，加 `js` 语句。

**DOM2的写法：**

::: {.language-javascript .extra-class}
``` language-javascript

                                element.
                                addEventListener
                                (
                                'click'
                                ,
                                function
                                (
                                )
                                {
                                }
                                ,
                                false
                                )
                                ;


```
:::

> 【重要】上面的第三参数中，**true** 表示事件在**捕获阶段**
> 触发，**false** 表示事件在**冒泡阶段**
> 触发（默认）。如果不写，则默认为false。

**DOM3的写法：**

::: {.language-javascript .extra-class}
``` language-javascript

                                element.
                                addEventListener
                                (
                                'keyup'
                                ,
                                function
                                (
                                )
                                {
                                }
                                ,
                                false
                                )
                                ;


```
:::

> `DOM3` 中，增加了很多事件类型，比如鼠标事件、键盘事件等。

> PS：为何事件没有`DOM1` 的写法呢？因为，`DOM1`
> 标准制定的时候，没有涉及与事件相关的内容。

**总结** ：关于"DOM事件的级别"，能回答出以上内容即可，不会出题目让你做。

**DOM事件模型**

> `DOM` 事件模型讲的就是**捕获和冒泡** ，一般人都能回答出来。

-   捕获：从上往下。
-   冒泡：从下（目标元素）往上。

**DOM事件流**

> `DOM`
> 事件流讲的就是：浏览器在于当前页面做交互时，这个事件是怎么传递到页面上的。

**完整的事件流，分三个阶段：**

1.  捕获：从 `window` 对象传到 目标元素。
2.  目标阶段：事件通过捕获，到达目标元素，这个阶段就是目标阶段。
3.  冒泡：从**目标元素** 传到 `Window` 对象。

**描述DOM事件捕获的具体流程**

> 很少有人能说完整。

**捕获的流程**

**说明** ：捕获阶段，事件依次传递的顺序是：`window` \--\>`document`
\--\>`html` \--\>`body` \--\>父元素、子元素、目标元素。

-   PS1：第一个接收到事件的对象是 **window** （有人会说`body`
    ，有人会说`html` ，这都是错误的）。
-   PS2：`JS` 中涉及到`DOM` 对象时，有两个对象最常用：`window`
    、`doucument` 。它们俩也是最先获取到事件的。

代码如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                window.
                                addEventListener
                                (
                                "click "
                                ,
                                function
                                (
                                )
                                {
                                alert
                                (
                                "捕获 window "
                                )
                                ;
                                }
                                ,
                                true
                                )
                                ;
                                document.
                                addEventListener
                                (
                                "click "
                                ,
                                function
                                (
                                )
                                {
                                alert
                                (
                                "捕获 document "
                                )
                                ;
                                }
                                ,
                                true
                                )
                                ;
                                document.
                                documentElement.
                                addEventListener
                                (
                                "click "
                                ,
                                function
                                (
                                )
                                {
                                alert
                                (
                                "捕获 html "
                                )
                                ;
                                }
                                ,
                                true
                                )
                                ;
                                document.
                                body.
                                addEventListener
                                (
                                "click "
                                ,
                                function
                                (
                                )
                                {
                                alert
                                (
                                "捕获 body "
                                )
                                ;
                                }
                                ,
                                true
                                )
                                ;
                                fatherBox.
                                addEventListener
                                (
                                "click "
                                ,
                                function
                                (
                                )
                                {
                                alert
                                (
                                "捕获 father "
                                )
                                ;
                                }
                                ,
                                true
                                )
                                ;
                                childBox.
                                addEventListener
                                (
                                "click "
                                ,
                                function
                                (
                                )
                                {
                                alert
                                (
                                "捕获 child "
                                )
                                ;
                                }
                                ,
                                true
                                )
                                ;


```
:::

**补充一个知识点：**

> 在 `js` 中：

-   如果想获取 `body` 节点，方法是：`document.body` ；
-   但是，如果想获取 `html` 节点，方法是`document.documentElement` 。

**冒泡的流程**

> 与捕获的流程相反

**Event对象的常见 api 方法**

> 用户做的是什么操作（比如，是敲键盘了，还是点击鼠标了），这些事件基本都是通过`Event`
> 对象拿到的。这些都比较简单，我们就不讲了。我们来看看下面这几个方法：

**方法一**

::: {.language-javascript .extra-class}
``` language-javascript

                                event.
                                preventDefault
                                (
                                )
                                ;


```
:::

-   解释：阻止默认事件。
-   比如，已知`<a >` 标签绑定了click事件，此时，如果给`<a >`
    设置了这个方法，就阻止了链接的默认跳转。

**方法二：阻止冒泡**

> 这个在业务中很常见。

> 有的时候，业务中不需要事件进行冒泡。比如说，业务这样要求：单击子元素做事件`A`
> ，单击父元素做事件B，如果不阻止冒泡的话，出现的问题是：单击子元素时，子元素和父元素都会做事件`A`
> 。这个时候，就要用到阻止冒泡了。

> `w3c` 的方法：（火狐、谷歌、`IE11` ）

::: {.language-javascript .extra-class}
``` language-javascript

                                event.
                                stopPropagation
                                (
                                )
                                ;


```
:::

> `IE10` 以下则是：

::: {.language-javascript .extra-class}
``` language-javascript

                                event.
                                cancelBubble =
                                true
                                ;


```
:::

> 兼容代码如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                box3.
                                onclick
                                =
                                function
                                (
                                event
                                )
                                {
                                alert
                                (
                                "child "
                                )
                                ;
                                //阻止冒泡
                                event =
                                event ||
                                window.
                                event;
                                if
                                (
                                event &&
                                event.
                                stopPropagation)
                                {
                                event.
                                stopPropagation
                                (
                                )
                                ;
                                }
                                else
                                {
                                event.
                                cancelBubble =
                                true
                                ;
                                }
                                }


```
:::

> 上方代码中，我们对`box3`
> 进行了阻止冒泡，产生的效果是：事件不会继续传递到 `father`
> 、`grandfather` 、`body` 了。

**方法三：设置事件优先级**

::: {.language-javascript .extra-class}
``` language-javascript

                                event.
                                stopImmediatePropagation
                                (
                                )
                                ;


```
:::

这个方法比较长，一般人没听说过。解释如下：

> 比如说，我用`addEventListener` 给某按钮同时注册了事件`A` 、事件`B`
> 。此时，如果我单击按钮，就会依次执行事件A和事件`B`
> 。现在要求：单击按钮时，只执行事件A，不执行事件`B`
> 。该怎么做呢？这是时候，就可以用到`stopImmediatePropagation`
> 方法了。做法是：在事件A的响应函数中加入这句话。

> 大家要记住 `event` 有这个方法。

**属性4、属性5（事件委托中用到）**

::: {.language-javascript .extra-class}
``` language-javascript

                                event.
                                currentTarget   //当前所绑定的事件对象。在事件委托中，指的是【父元素】。
                                event.
                                target  //当前被点击的元素。在事件委托中，指的是【子元素】。


```
:::

上面这两个属性，在事件委托中经常用到。

> **总结** ：上面这几项，非常重要，但是容易弄混淆。

**自定义事件**

> 自定义事件的代码如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                var
                                myEvent =
                                new
                                Event
                                (
                                'clickTest'
                                )
                                ;
                                element.
                                addEventListener
                                (
                                'clickTest'
                                ,
                                function
                                (
                                )
                                {
                                console.
                                log
                                (
                                'smyhvae'
                                )
                                ;
                                }
                                )
                                ;
                                //元素注册事件
                                element.
                                dispatchEvent
                                (
                                myEvent)
                                ;
                                //注意，参数是写事件对象 myEvent，不是写 事件名 clickTest


```
:::

> 上面这个事件是定义完了之后，就直接自动触发了。在正常的业务中，这个事件一般是和别的事件结合用的。比如延时器设置按钮的动作：

::: {.language-javascript .extra-class}
``` language-javascript

                                var
                                myEvent =
                                new
                                Event
                                (
                                'clickTest'
                                )
                                ;
                                element.
                                addEventListener
                                (
                                'clickTest'
                                ,
                                function
                                (
                                )
                                {
                                console.
                                log
                                (
                                'smyhvae'
                                )
                                ;
                                }
                                )
                                ;
                                setTimeout
                                (
                                function
                                (
                                )
                                {
                                element.
                                dispatchEvent
                                (
                                myEvent)
                                ;
                                //注意，参数是写事件对象 myEvent，不是写 事件名 clickTest
                                }
                                ,
                                1000
                                )
                                ;


```
:::

## [\#](#四、event-loop详细版){.header-anchor} 四、Event Loop详细版 {#四、event-loop详细版}

### [\#](#为什么-gui-渲染线程为什么与-js-引擎线程互斥){.header-anchor} 为什么 GUI 渲染线程为什么与 JS 引擎线程互斥

-   这是由于 JS 是可以操作 DOM 的，如果同时修改元素属性并同时渲染界面(即
    JS线程和 UI线程同时运行)
-   那么渲染线程前后获得的元素就可能不一致了
-   因此，为了防止渲染出现不可预期的结果，浏览器设定 GUI渲染线程和
    JS引擎线程为互斥关系
-   当 JS引擎线程执行时
    GUI渲染线程会被挂起，GUI更新则会被保存在一个队列中等待
    JS引擎线程空闲时立即被执行

### [\#](#从-event-loop-看-js-的运行机制){.header-anchor} 从 Event Loop 看 JS 的运行机制

**先理解一些概念：**

-   `JS` 分为同步任务和异步任务
-   同步任务都在JS引擎线程上执行，形成一个 执行栈
-   事件触发线程管理一个 任务队列，异步任务触发条件达成，将回调事件放到
    任务队列中
-   执行栈中所有同步任务执行完毕，此时JS引擎线程空闲，系统会读取
    任务队列，将可运行的异步任务回调事件添加到 执行栈中，开始执行

```{=html}
<!-- -->
```
-   前端开发中我们会通过 `setTimeout/setInterval` 来指定定时任务，会通过
    `XHR/fetch` 发送网络请求
-   接下来简述一下 `setTimeout/setInterval` 和 `XHR/fetch`
    到底做了什么事
-   我们知道，不管是 `setTimeout/setInterval` 和 `XHR/fetch`
    代码，在这些代码执行时，
    本身是同步任务，而其中的回调函数才是异步任务
-   当代码执行到 `setTimeout/setInterval` 时，实际上是 JS引擎线程通知
    定时触发器线程，间隔一个时间后，会触发一个回调事件
-   而定时触发器线程在接收到这个消息后，会在等待的时间后，将回调事件放入到由
    事件触发线程所管理的事件队列中
-   当代码执行到 `XHR/fetch` 时，实际上是 `JS` 引擎线程通知 异步`http`
    请求线程，发送一个网络请求，并制定请求完成后的回调事件
-   而异步`http`
    请求线程在接收到这个消息后，会在请求成功后，将回调事件放入到由
    事件触发线程所管理的 事件队列中
-   当我们的同步任务执行完，`JS` 引擎线程会询问事件触发线程，在
    事件队列中是否有待执行的回调函数，如果有就会加入到执行栈中交给
    JS引擎线程执行

**总结一下：**

-   JS引擎线程只执行执行栈中的事件
-   执行栈中的代码执行完毕，就会读取事件队列中的事件
-   事件队列中的回调事件，是由各自线程插入到事件队列中的
-   如此循环

> 当我们基本了解了什么是执行栈，什么是事件队列之后，我们深入了解一下事件循环中
> 宏任务、 微任务

### [\#](#什么是宏任务){.header-anchor} 什么是宏任务

-   我们可以将每次执行栈执行的代码当做是一个宏任务（包括每次从事件队列中获取一个事件回调并放到执行栈中执行）
-   每一个宏任务会从头到尾执行完毕，不会执行其他。

> 我们前文提到过 JS引擎线程和 GUI渲染线程是互斥的关系，浏览器为了能够使
> 宏任务和 DOM任务有序的进行，会在一个 宏任务执行结果后，在下一个
> 宏任务执行前， GUI渲染线程开始工作，对页面进行渲染。

::: {.language- .extra-class}
``` language-text
                            // 宏任务-->渲染-->宏任务-->渲染-->渲染．．


```
:::

> 主代码块，`setTimeout` ，`setInterval` 等，都属于宏任务

**第一个例子：**

我们可以将这段代码放到浏览器的控制台执行以下，看一下效果：

> 我们会看到的结果是，页面背景会在瞬间变成白色，以上代码属于同一次
> 宏任务，所以全部执行完才触发 页面渲染，渲染时
> GUI线程会将所有UI改动优化合并，所以视觉效果上，只会看到页面变成灰色

**第二个例子：**

> 我会看到，页面先显示成蓝色背景，然后瞬间变成了黑色背景，这是因为以上代码属于两次
> 宏任务，第一次
> 宏任务执行的代码是将背景变成蓝色，然后触发渲染，将页面变成蓝色，再触发第二次宏任务将背景变成黑色

### [\#](#什么是微任务){.header-anchor} 什么是微任务

-   我们已经知道 宏任务结束后，会执行渲染，然后执行下一个 宏任务，
-   而微任务可以理解成在当前 宏任务执行后立即执行的任务。
-   也就是说，**当 宏任务执行完，会在渲染前，将执行期间所产生的所有
    微任务都执行完** 。

> `Promise` ，`process.nextTick` 等，属于 微任务。

-   控制台输出 1 3 2 , 是因为 promise 对象的 then
    方法的回调函数是异步执行，所以 2 最后输出
-   页面的背景色直接变成黑色，没有经过蓝色的阶段，是因为，我们在宏任务中将背景设置为蓝色，但在进行渲染前执行了微任务，在微任务中将背景变成了黑色，然后才执行的渲染

> 上面代码共包含两个 `setTimeout` ，也就是说除主代码块外，共有两个
> 宏任务， 其中第一个 宏任务执行中，输出 1 ，并且创建了
> 微任务队列，所以在下一个 宏任务队列执行前，先执行 微任务，在
> 微任务执行中，输出 3 ，微任务执行后，执行下一次 宏任务，执行中输出 2

### [\#](#总结){.header-anchor} 总结

-   执行一个 宏任务（栈中没有就从 事件队列中获取）
-   执行过程中如果遇到 微任务，就将它添加到 微任务的任务队列中
-   宏任务执行完毕后，立即执行当前 微任务队列中的所有 微任务（依次执行）
-   当前 宏任务执行完毕，开始检查渲染，然后 GUI线程接管渲染
-   渲染完毕后， JS线程继续接管，开始下一个 宏任务（从事件队列中获取）

## [\#](#五、css盒模型及bfc){.header-anchor} 五、CSS盒模型及BFC {#五、css盒模型及bfc}

**题目：谈一谈你对CSS盒模型的认识**

> 专业的面试，一定会问 `CSS`
> 盒模型。对于这个题目，我们要回答一下几个方面：

1.  基本概念：`content` 、`padding` 、`margin`
2.  标准盒模型、`IE` 盒模型的区别。不要漏说了`IE`
    盒模型，通过这个问题，可以筛选一部分人
3.  `CSS`
    如何设置这两种模型（即：如何设置某个盒子为其中一个模型）？如果回答了上面的第二条，还会继续追问这一条。
4.  `JS`
    如何设置、获取盒模型对应的宽和高？这一步，已经有很多人答不上来了。
5.  实例题：根据盒模型解释**边距重叠** 。

> 前四个方面是逐渐递增，第五个方面，却鲜有人知。

6.  `BFC` （边距重叠解决方案）或`IFC` 。

> 如果能回答第五条，就会引出第六条。`BFC` 是面试频率较高的。

**总结** ：以上几点，从上到下，知识点逐渐递增，知识面从理论、`CSS`
、`JS` ，又回到`CSS` 理论

接下来，我们把上面的六条，依次讲解。

**标准盒模型和IE盒子模型**

标准盒子模型：

`IE` 盒子模型：

上图显示：

> 在 `CSS` 盒子模型 (`Box Model` ) 规定了元素处理元素的几种方式：

-   `width` 和`height` ：**内容** 的宽度、高度（不是盒子的宽度、高度）。
-   `padding` ：内边距。
-   `border` ：边框。
-   `margin` ：外边距。

> `CSS` 盒模型和`IE` 盒模型的区别：

-   在**标准盒子模型** 中，**width 和 height 指的是内容区域**
    的宽度和高度。增加内边距、边框和外边距不会影响内容区域的尺寸，但是会增加元素框的总尺寸。

-   **IE盒子模型** 中，**width 和 height 指的是内容区域+border+padding**
    的宽度和高度。

**CSS如何设置这两种模型**

代码如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                /* 设置当前盒子为 标准盒模型（默认） */
                                box-
                                sizing:
                                content-
                                box;
                                /* 设置当前盒子为 IE盒模型 */
                                box-
                                sizing:
                                border-
                                box;


```
:::

> 备注：盒子默认为标准盒模型。

**JS如何设置、获取盒模型对应的宽和高**

> 方式一：通过`DOM` 节点的 `style` 样式获取

::: {.language-js .extra-class}
``` language-js

                                element.
                                style.
                                width/
                                height;


```
:::

> 缺点：通过这种方式，只能获取**行内样式** ，不能获取`内嵌`
> 的样式和`外链` 的样式。

这种方式有局限性，但应该了解。

> 方式二（通用型）

::: {.language-js .extra-class}
``` language-js

                                window.
                                getComputedStyle
                                (
                                element)
                                .
                                width/
                                height;


```
:::

> 方式二能兼容 `Chrome` 、火狐。是通用型方式。

> 方式三（IE独有的）

::: {.language-javascript .extra-class}
``` language-javascript

                                element.
                                currentStyle.
                                width/
                                height;


```
:::

> 和方式二相同，但这种方式只有IE独有。获取到的即时运行完之后的宽高（三种css样式都可以获取）。

> 方式四

::: {.language-javascript .extra-class}
``` language-javascript

                                element.
                                getBoundingClientRect
                                (
                                )
                                .
                                width/
                                height;


```
:::

> 此 `api` 的作用是：获取一个元素的绝对位置。绝对位置是视窗 `viewport`
> 左上角的绝对位置。此 `api` 可以拿到四个属性：`left` 、`top` 、`width`
> 、`height` 。

**总结：**

> 上面的四种方式，要求能说出来区别，以及哪个的通用型更强。

**margin塌陷/margin重叠**

**标准文档流中，竖直方向的margin不叠加，只取较大的值作为margin**
(水平方向的`margin` 是可以叠加的，即水平方向没有塌陷现象)。

> PS：如果不在标准流，比如盒子都浮动了，那么两个盒子之间是没有`margin`
> 重叠的现象的。

> 我们来看几个例子。

**兄弟元素之间**

如下图所示：

**子元素和父元素之间**

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        *
                                        {
                                        margin
                                        :
                                        0;
                                        padding
                                        :
                                        0;
                                        }
                                        .father
                                        {
                                        background
                                        :
                                        green;
                                        }
                                        /* 给儿子设置margin-top为10像素 */
                                        .son
                                        {
                                        height
                                        :
                                        100px;
                                        margin-top
                                        :
                                        10px;
                                        background
                                        :
                                        red;
                                        }




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        father"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        son"

                                    >



                                        </
                                        div

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



```
:::

> 上面的代码中，儿子的`height` 是 `100p` x，`magin-top` 是`10px`
> 。注意，此时父亲的 `height` 是`100` ，而不是`110`
> 。因为儿子和父亲在竖直方向上，共一个`margin` 。

儿子这个盒子：

父亲这个盒子：

> 上方代码中，如果我们给父亲设置一个属性：`overflow: hidden`
> ，就可以避免这个问题，此时父亲的高度是110px，这个用到的就是BFC（下一段讲解）。

**善于使用父亲的padding，而不是儿子的margin**

> 其实，这一小段讲的内容与上一小段相同，都是讲父子之间的margin重叠。

我们来看一个奇怪的现象。现在有下面这样一个结构：（`div` 中放一个`p` ）

::: {.language-html .extra-class}
``` language-html



                                        <
                                        div

                                    >



                                        <
                                        p

                                    >



                                        </
                                        p

                                    >



                                        </
                                        div

                                    >



```
:::

> 上面的结构中，我们尝试通过给儿子`p` 一个`margin-top:50px;`
> 的属性，让其与父亲保持50px的上边距。结果却看到了下面的奇怪的现象：

> 此时我们给父亲`div` 加一个`border` 属性，就正常了：

> 如果父亲没有`border` ，那么儿子的`margin`
> 实际上踹的是"流"，踹的是这"行"。所以，父亲整体也掉下来了。

**margin这个属性，本质上描述的是兄弟和兄弟之间的距离；
最好不要用这个marign表达父子之间的距离。**

> 所以，如果要表达父子之间的距离，我们一定要善于使用父亲的padding，而不是儿子的\`margin。

**BFC（边距重叠解决方案）**

> `BFC（Block Formatting Context）`
> ：块级格式化上下文。你可以把它理解成一个独立的区域。

另外还有个概念叫`IFC` 。不过，`BFC` 问得更多。

**BFC 的原理/BFC的布局规则【非常重要】**

> `BFC` 的原理，其实也就是 `BFC`
> 的渲染规则（能说出以下四点就够了）。包括：

1.  BFC **内部的** 子元素，在垂直方向，**边距会发生重叠** 。
2.  BFC在页面中是独立的容器，外面的元素不会影响里面的元素，反之亦然。（稍后看`举例1`
    ）
3.  **BFC区域不与旁边的`float box` 区域重叠**
    。（可以用来清除浮动带来的影响）。（稍后看`举例2` ）
4.  计算`BFC` 的高度时，浮动的子元素也参与计算。（稍后看`举例3` ）

**如何生成BFC**

> 有以下几种方法：

-   方法1：`overflow` : 不为`visible` ，可以让属性是 `hidden` 、`auto`
    。【最常用】
-   方法2：浮动中：`float` 的属性值不为`none`
    。意思是，只要设置了浮动，当前元素就创建了`BFC` 。
-   方法3：定位中：只要`posiiton` 的值不是 s`tatic` 或者是`relative`
    即可，可以是`absolute` 或`fixed` ，也就生成了一个`BFC` 。
-   方法4：`display` 为`inline-block` , `table-cell` , `table-caption` ,
    `flex` , `inline-flex`

**BFC 的应用**

\*\*举例1：\*\*解决 margin 重叠

> 当父元素和子元素发生 `margin`
> 重叠时，解决办法：**给子元素或父元素创建BFC** 。

比如说，针对下面这样一个 `div` 结构：

::: {.language-html .extra-class}
``` language-html



                                        <
                                        div

                                    class

                                        =
                                        "
                                        father"

                                    >



                                        <
                                        p

                                    class

                                        =
                                        "
                                        son"

                                    >



                                        </
                                        p

                                    >



                                        </
                                        div

                                    >



```
:::

> 上面的`div` 结构中，如果父元素和子元素发生`margin`
> 重叠，我们可以给子元素创建一个 `BFC` ，就解决了：

::: {.language-html .extra-class}
``` language-html



                                        <
                                        div

                                    class

                                        =
                                        "
                                        father"

                                    >



                                        <
                                        p

                                    class

                                        =
                                        "
                                        son"


                                        style

                                            =
                                            "

                                                overflow
                                                :
                                                hidden

                                            "


                                    >



                                        </
                                        p

                                    >



                                        </
                                        div

                                    >



```
:::

> 因为**第二条：BFC区域是一个独立的区域，不会影响外面的元素** 。

**举例2** ：BFC区域不与float区域重叠：

针对下面这样一个div结构；

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        .father-layout
                                        {
                                        background
                                        :
                                        pink;
                                        }
                                        .father-layout .left
                                        {
                                        float
                                        :
                                        left;
                                        width
                                        :
                                        100px;
                                        height
                                        :
                                        100px;
                                        background
                                        :
                                        green;
                                        }
                                        .father-layout .right
                                        {
                                        height
                                        :
                                        150px;
                                        /*右侧标准流里的元素，比左侧浮动的元素要高*/
                                        background
                                        :
                                        red;
                                        }




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >



                                        <
                                        section

                                    class

                                        =
                                        "
                                        father-layout"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        left"

                                    >

                                左侧，生命壹号



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"

                                    >

                                右侧，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，



                                        </
                                        div

                                    >



                                        </
                                        section

                                    >



                                        </
                                        body

                                    >



                                        </
                                        html

                                    >



```
:::

效果如下：

> 上图中，由于右侧标准流里的元素，比左侧浮动的元素要高，导致右侧有一部分会跑到左边的下面去。

**如果要解决这个问题，可以将右侧的元素创建BFC** ，因为
**第三条：BFC区域不与`float box` 区域重叠**
。解决办法如下：（将right区域添加overflow属性）

::: {.language-html .extra-class}
``` language-html



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"


                                        style

                                            =
                                            "

                                                overflow
                                                :
                                                hidden

                                            "


                                    >

                                右侧，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，smyhvae，



                                        </
                                        div

                                    >



```
:::

上图表明，解决之后，`father-layout` 的背景色显现出来了，说明问题解决了。

\*\*举例3：\*\*清除浮动

现在有下面这样的结构：

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        .father
                                        {
                                        background
                                        :
                                        pink;
                                        }
                                        .son
                                        {
                                        float
                                        :
                                        left;
                                        background
                                        :
                                        green;
                                        }




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >



                                        <
                                        section

                                    class

                                        =
                                        "
                                        father"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        son"

                                    >

                                生命壹号



                                        </
                                        div

                                    >



                                        </
                                        section

                                    >



                                        </
                                        body

                                    >



                                        </
                                        html

                                    >



```
:::

效果如下：

上面的代码中，儿子浮动了，但由于父亲没有设置高度，导致看不到父亲的背景色（此时父亲的高度为0）。正所谓**有高度的盒子，才能关住浮动**
。

> 如果想要清除浮动带来的影响，方法一是给父亲设置高度，然后采用隔墙法。方法二是
> BFC：给父亲增加 `overflow=hidden` 属性即可， 增加之后，效果如下：

> 为什么父元素成为BFC之后，就有了高度呢？这就回到了**第四条：计算BFC的高度时，浮动元素也参与计算**
> 。意思是，**在计算BFC的高度时，子元素的float box也会参与计算**

## [\#](#六、页面布局){.header-anchor} 六、页面布局 {#六、页面布局}

> 问题：假设高度默认`100px` ，请写出三栏布局，其中左栏、右栏各为`300px`
> ，中间自适应。

分析：

初学者想到的答案有两种：

-   方法1：浮动
-   方法2：绝对定位

> 但要求你能至少写出三四种方法，才算及格。剩下的方法如下：

-   方法3：`flexbox` 。移动开发里经常用到。
-   方法4：表格布局`table` 。虽然已经淘汰了，但也应该了解。
-   方法5：网格布局 `grid`

**方法1、浮动：**

> 左侧设置左浮动，右侧设置右浮动即可，中间会自动地自适应。

**方法2、绝对定位：**

> 左侧设置为绝对定位， `left：0px` 。右侧设置为绝对定位， `right：0px`
> 。中间设置为绝对定位，`left` 和`right` 都为`300px`
> ，即可。中间的宽度会自适应。

> 使用`article` 标签作为容器，包裹左、中、右三个部分。

> 方法1 和方法2 的代码如下：

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        html *
                                        {
                                        padding
                                        :
                                        0px;
                                        margin
                                        :
                                        0px;
                                        }
                                        .layout
                                        {
                                        margin-bottom
                                        :
                                        150px;
                                        }
                                        .layout article div
                                        {
                                        /*注意，这里是设置每个小块儿的高度为100px，而不是设置大容器的高度。大容器的高度要符合响应式*/
                                        height
                                        :
                                        100px;
                                        }
                                        /* 方法一 start */
                                        .layout.float .left
                                        {
                                        float
                                        :
                                        left;
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        red;
                                        }
                                        .layout.float .right
                                        {
                                        float
                                        :
                                        right;
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        blue;
                                        }
                                        .layout.float .center
                                        {
                                        background
                                        :
                                        green;
                                        }
                                        /* 方法一 end */
                                        /* 方法二 start */
                                        .layout.absolute .left-center-right
                                        {
                                        position
                                        :
                                        relative;
                                        }
                                        .layout.absolute .left
                                        {
                                        position
                                        :
                                        absolute;
                                        left
                                        :
                                        0;
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        red;
                                        }
                                        /* 【重要】中间的区域，左侧定位300px，右侧定位为300px，即可完成。宽度会自使用 */
                                        .layout.absolute .center
                                        {
                                        position
                                        :
                                        absolute;
                                        left
                                        :
                                        300px;
                                        right
                                        :
                                        300px;
                                        background
                                        :
                                        green;
                                        }
                                        .layout.absolute .right
                                        {
                                        position
                                        :
                                        absolute;
                                        right
                                        :
                                        0;
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        blue;
                                        }
                                        /* 方法二 end */




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >

                                <!-- 方法一：浮动 start -->
                                <!-- 输入 section.layout.float，即可生成  -->


                                        <
                                        section

                                    class

                                        =
                                        "
                                        layout float"

                                    >

                                <!-- 用  article 标签包裹左、中、右三个部分 -->


                                        <
                                        article

                                    class

                                        =
                                        "
                                        left-right-center"

                                    >

                                <!-- 输入 div.left+div.right+div.center，即可生成 -->


                                        <
                                        div

                                    class

                                        =
                                        "
                                        left"

                                    >

                                我是 left



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"

                                    >

                                我是 right



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        center"

                                    >

                                浮动解决方案
        我是 center



                                        </
                                        div

                                    >



                                        </
                                        article

                                    >



                                        </
                                        section

                                    >

                                <!-- 方法一：浮动 end -->


                                        <
                                        section

                                    class

                                        =
                                        "
                                        layout absolute"

                                    >



                                        <
                                        article

                                    class

                                        =
                                        "
                                        left-center-right"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        left"

                                    >

                                我是 left



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"

                                    >

                                我是 right



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        center"

                                    >



                                        <
                                        h1

                                    >

                                绝对定位解决方案


                                        </
                                        h1

                                    >

                                我是 center



                                        </
                                        div

                                    >



                                        </
                                        article

                                    >



                                        </
                                        section

                                    >



                                        </
                                        body

                                    >



                                        </
                                        html

                                    >



```
:::

效果如下：

**方法3、flexbox布局**

> 将左中右所在的容器设置为`display: flex`
> ，设置两侧的宽度后，然后让中间的`flex = 1` ，即可。

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        html *
                                        {
                                        padding
                                        :
                                        0;
                                        margin
                                        :
                                        0;
                                        }
                                        .layout article div
                                        {
                                        height
                                        :
                                        100px;
                                        }
                                        .left-center-right
                                        {
                                        display
                                        :
                                        flex;
                                        }
                                        .layout.flex .left
                                        {
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        red;
                                        }
                                        .layout.flex .center
                                        {
                                        flex
                                        :
                                        1;
                                        background
                                        :
                                        green;
                                        }
                                        .layout.flex .right
                                        {
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        blue;
                                        }




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >



                                        <
                                        section

                                    class

                                        =
                                        "
                                        layout flex"

                                    >



                                        <
                                        article

                                    class

                                        =
                                        "
                                        left-center-right-"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        left"

                                    >

                                我是 left



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        center"

                                    >



                                        <
                                        h1

                                    >

                                flex布局解决方案


                                        </
                                        h1

                                    >

                                我是 center



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"

                                    >

                                我是 right



                                        </
                                        div

                                    >



                                        </
                                        article

                                    >



                                        </
                                        section

                                    >



                                        </
                                        body

                                    >



                                        </
                                        html

                                    >



```
:::

效果如下：

**方法4、表格布局 table**

> 设置整个容器的宽度为`100%` ，设置三个部分均为表格，然后左边的单元格为
> `300px` ，右边的单元格为 `300px` ，即可。中间的单元格会自适应。

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        html *
                                        {
                                        padding
                                        :
                                        0;
                                        margin
                                        :
                                        0;
                                        }
                                        .layout.table div
                                        {
                                        height
                                        :
                                        100px;
                                        }
                                        /* 重要：设置容器为表格布局，宽度为100% */
                                        .layout.table .left-center-right
                                        {
                                        width
                                        :
                                        100%;
                                        display
                                        :
                                        table;
                                        height
                                        :
                                        100px;
                                        }
                                        .layout.table .left-center-right div
                                        {
                                        display
                                        :
                                        table-cell;
                                        /* 重要：设置三个模块为表格里的单元*/
                                        }
                                        .layout.table .left
                                        {
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        red;
                                        }
                                        .layout.table .center
                                        {
                                        background
                                        :
                                        green;
                                        }
                                        .layout.table .right
                                        {
                                        width
                                        :
                                        300px;
                                        background
                                        :
                                        blue;
                                        }




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >



                                        <
                                        section

                                    class

                                        =
                                        "
                                        layout table"

                                    >



                                        <
                                        article

                                    class

                                        =
                                        "
                                        left-center-right"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        left"

                                    >

                                我是 left



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        center"

                                    >



                                        <
                                        h1

                                    >

                                表格布局解决方案


                                        </
                                        h1

                                    >

                                我是 center



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"

                                    >

                                我是 right



                                        </
                                        div

                                    >



                                        </
                                        article

                                    >



                                        </
                                        section

                                    >



                                        </
                                        body

                                    >



                                        </
                                        html

                                    >



```
:::

**方法5、网格布局 grid**

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

                                    >



                                        <
                                        title

                                    >

                                Document


                                        </
                                        title

                                    >



                                        <
                                        style

                                    >



                                        html *
                                        {
                                        padding
                                        :
                                        0;
                                        margin
                                        :
                                        0;
                                        }
                                        /* 重要：设置容器为网格布局，宽度为100% */
                                        .layout.grid .left-center-right
                                        {
                                        display
                                        :
                                        grid;
                                        width
                                        :
                                        100%;
                                        grid-template-rows
                                        :
                                        100px;
                                        grid-template-columns
                                        :
                                        300px auto 300px;
                                        /* 重要：设置网格为三列，并设置每列的宽度。即可。*/
                                        }
                                        .layout.grid .left
                                        {
                                        background
                                        :
                                        red;
                                        }
                                        .layout.grid .center
                                        {
                                        background
                                        :
                                        green;
                                        }
                                        .layout.grid .right
                                        {
                                        background
                                        :
                                        blue;
                                        }




                                        </
                                        style

                                    >



                                        </
                                        head

                                    >



                                        <
                                        body

                                    >



                                        <
                                        section

                                    class

                                        =
                                        "
                                        layout grid"

                                    >



                                        <
                                        article

                                    class

                                        =
                                        "
                                        left-center-right"

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        left"

                                    >

                                我是 left



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        center"

                                    >



                                        <
                                        h1

                                    >

                                网格布局解决方案


                                        </
                                        h1

                                    >

                                我是 center



                                        </
                                        div

                                    >



                                        <
                                        div

                                    class

                                        =
                                        "
                                        right"

                                    >

                                我是 right



                                        </
                                        div

                                    >



                                        </
                                        article

                                    >



                                        </
                                        section

                                    >



                                        </
                                        body

                                    >



                                        </
                                        html

                                    >



```
:::

效果：

**延伸：五种方法的对比**

> 五种方法的优缺点

-   考虑中间模块的高度问题
-   兼容性问题：实际开发中，哪个最实用？

方法1：浮动：

-   优点：兼容性好。
-   缺点：浮动会脱离标准文档流，因此要清除浮动。我们解决好这个问题即可。

方法:2：绝对定位

-   优点：快捷。
-   缺点：导致子元素也脱离了标准文档流，可实用性差。

方法3：flex 布局（CSS3中出现的）

-   优点：解决上面两个方法的不足，flex布局比较完美。移动端基本用
    flex布局。

方法4：表格布局

-   优点：表格布局在很多场景中很实用，兼容性非常好。因为IE8不支持
    flex，此时可以尝试表格布局
-   缺点：因为三个部分都当成了**单元格**
    来对待，此时，如果中间的部分变高了，其会部分也会被迫调整高度。但是，在很多场景下，我们并不需要两侧的高度增高。

> 什么时候用 `flex` 布局 or
> 表格布局，看具体的场景。二者没有绝对的优势，也没有绝对的不足。

方法5：网格布局

-   CSS3中引入的布局，很好用。代码量简化了很多。

> PS：面试提到网格布局，说明我们对新技术是有追求的。

**延伸：如果题目中去掉高度已知**

> 问题：题目中，如果去掉高度已知，我们往中间的模块里塞很多内容，让中间的模块撑开。会发生什么变化？哪个布局就不能用了？

分析：其实可以这样理解，我们回去看上面的动画效果，当中间的模块变得很挤时，会发生什么效果？就是我们想要的答案。

> 答案是：**flex 布局和表格布局可以通用** ，其他三个布局都不能用了。

**总结**

> 涉及到的知识点：

-   语义化掌握到位：每个区域用`section` 、`article` 代表容器、`div`
    代表块儿。如果通篇都用 div，那就是语义化没掌握好。
-   页面布局理解深刻。
-   `CSS` 基础知识扎实。
-   思维灵活且积极上进。题目中可以通过`网格布局` 来体现。
-   代码书写规范。注意命名。上面的代码中，没有一行代码是多的。

## [\#](#七、安全问题-csrf和xss){.header-anchor} 七、安全问题：CSRF和XSS {#七、安全问题-csrf和xss}

### [\#](#_1-前言-2){.header-anchor} 1 前言 {#_1-前言-2}

> 面试中的安全问题，明确来说，就两个方面：

-   `CSRF` ：基本概念、攻击方式、防御措施
-   `XSS` ：基本概念、攻击方式、防御措施

> 这两个问题，一般不会问太难。

> 有人问：`SQL` 注入算吗？答案：这个其实跟前端的关系不是很大。

### [\#](#_2-csrf){.header-anchor} 2 CSRF {#_2-csrf}

> 问的不难，一般问：

-   `CSRF` 的基本概念、缩写、全称
-   攻击原理
-   防御措施

> 如果把**攻击原理** 和**防御措施** 掌握好，基本没什么问题。

#### [\#](#_2-1-csrf的基本概念、缩写、全称){.header-anchor} 2.1 CSRF的基本概念、缩写、全称 {#_2-1-csrf的基本概念、缩写、全称}

> `CSRF` （`Cross-site request forgery` ）：**跨站请求伪造** 。

PS：中文名一定要记住。英文全称，如果记不住也拉倒。

#### [\#](#_2-2-csrf的攻击原理){.header-anchor} 2.2 CSRF的攻击原理 {#_2-2-csrf的攻击原理}

> 用户是网站A的注册用户，且登录进去，于是网站A就给用户下发`cookie` 。

> 从上图可以看出，要完成一次`CSRF` 攻击，受害者必须满足两个必要的条件：

1.  登录受信任网站`A` ，并在本地生成`Cookie` 。（如果用户没有登录网站`A`
    ，那么网站`B` 在诱导的时候，请求网站`A` 的`api`
    接口时，会提示你登录）
2.  在不登出`A` 的情况下，访问危险网站`B` （其实是利用了网站`A`
    的漏洞）。

> 我们在讲`CSRF` 时，一定要把上面的两点说清楚。

> 温馨提示一下，`cookie` 保证了用户可以处于登录状态，但网站`B`
> 其实拿不到 `cookie` 。

> 举个例子，前段时间里，微博网站有个`api`
> 接口有漏洞，导致很多用户的粉丝暴增。

#### [\#](#_2-3-csrf如何防御){.header-anchor} 2.3 CSRF如何防御 {#_2-3-csrf如何防御}

**方法一、Token 验证：** （用的最多）

1.  服务器发送给客户端一个`token` ；
2.  客户端提交的表单中带着这个`token` 。
3.  如果这个 `token` 不合法，那么服务器拒绝这个请求。

**方法二：隐藏令牌：**

-   把 `token` 隐藏在 `http` 的 `head` 头中。

> 方法二和方法一有点像，本质上没有太大区别，只是使用方式上有区别。

**方法三、Referer 验证：**

> `Referer`
> 指的是页面请求来源。意思是，**只接受本站的请求，服务器才做响应**
> ；如果不是，就拦截。

### [\#](#_3-xss){.header-anchor} 3 XSS {#_3-xss}

#### [\#](#_3-1-xss的基本概念){.header-anchor} 3.1 XSS的基本概念 {#_3-1-xss的基本概念}

> `XSS（Cross Site Scripting）` ：**跨域脚本攻击** 。

-   接下来，我们详细讲一下 `XSS` 的内容。

> 预备知识：`HTTP` 、`Cookie` 、`Ajax` 。

#### [\#](#_3-2-xss的攻击原理){.header-anchor} 3.2 XSS的攻击原理 {#_3-2-xss的攻击原理}

> `XSS`
> 攻击的核心原理是：不需要你做任何的登录认证，它会通过合法的操作（比如在`url`
> 中输入、在评论框中输入），向你的页面注入脚本（可能是`js` 、`hmtl`
> 代码块等）。

> 最后导致的结果可能是：

-   盗用`Cookie`
-   破坏页面的正常结构，插入广告等恶意内容
-   `D-doss` 攻击

#### [\#](#_3-3-xss的攻击方式){.header-anchor} 3.3 XSS的攻击方式 {#_3-3-xss的攻击方式}

1.  反射型

> 发出请求时，`XSS` 代码出现在`url`
> 中，作为输入提交到服务器端，服务器端解析后响应，`XSS`
> 代码随响应内容一起传回给浏览器，最后浏览器解析执行`XSS`
> 代码。这个过程像一次反射，所以叫反射型`XSS` 。

2.  存储型

> 存储型`XSS` 和反射型`XSS`
> 的差别在于，提交的代码会存储在服务器端（数据库、内存、文件系统等），下次请求时目标页面时不用再提交XSS代码。

#### [\#](#_3-4-xss的防范措施-encode-过滤){.header-anchor} 3.4 XSS的防范措施（encode + 过滤） {#_3-4-xss的防范措施-encode-过滤}

**XSS的防范措施主要有三个：**

**1. 编码** ：

> 对用户输入的数据进行`HTML Entity` 编码。

如上图所示，把字符转换成 转义字符。

> `Encode` 的作用是将`$var`
> 等一些字符进行转化，使得浏览器在最终输出结果上是一样的。

比如说这段代码：

::: {.language-html .extra-class}
``` language-html



                                        <
                                        script

                                    >



                                        alert
                                        (
                                        1
                                        )




                                        </
                                        script

                                    >



```
:::

> 若不进行任何处理，则浏览器会执行alert的js操作，实现XSS注入。

> 进行编码处理之后，L在浏览器中的显示结果就是`<script >alert(1)</script >`
> ，实现了将`$var` 作为纯文本进行输出，且不引起J`avaScript` 的执行。

**2、过滤：**

-   移除用户输入的和事件相关的属性。如`onerror`
    可以自动触发攻击，还有`onclick`
    等。（总而言是，过滤掉一些不安全的内容）
-   移除用户输入的`Style` 节点、`Script` 节点、`Iframe`
    节点。（尤其是`Script` 节点，它可是支持跨域的呀，一定要移除）。

**3、校正**

-   避免直接对`HTML Entity` 进行解码。
-   使用`DOM Parse` 转换，校正不配对的`DOM` 标签。

> 备注：我们应该去了解一下`DOM Parse`
> 这个概念，它的作用是把文本解析成`DOM` 结构。

比较常用的做法是，通过第一步的编码转成文本，然后第三步转成`DOM`
对象，然后经过第二步的过滤。

**还有一种简洁的答案：**

首先是encode，如果是富文本，就白名单。

### [\#](#_4-csrf-和-xss-的区别){.header-anchor} 4 CSRF 和 XSS 的区别 {#_4-csrf-和-xss-的区别}

> 面试官还可能喜欢问二者的区别。

**区别一：**

-   `CSRF` ：需要用户先登录网站`A` ，获取 `cookie`
-   `XSS` ：不需要登录。

**区别二：（原理的区别）**

-   `CSRF` ：是利用网站`A` 本身的漏洞，去请求网站`A` 的`api` 。
-   `XSS` ：是向网站 `A` 注入 `JS` 代码，然后执行 `JS`
    里的代码，篡改网站`A` 的内容。

## [\#](#八、跨域通信类){.header-anchor} 八、跨域通信类 {#八、跨域通信类}

### [\#](#_1-前言-3){.header-anchor} 1 前言 {#_1-前言-3}

从本章起，对代码的要求没之前那么高了，但是，要求你对知识面的掌握要足够宽。

**前端通信类的问题，主要包括以下内容** ：

1.  什么是**同源策略** 及限制

> 同源策略是一个概念，就一句话。有什么限制，就三句话。能说出来即可。

2.  **前后端如何通信**

> 如果你不准备，估计也就只能说出`ajax` 。这个可以考察出知识面。

3.  如何创建**Ajax**

> `Ajax` 在前后端通信中经常用到。做业务时，可以借助第三方的库，比如`vue`
> 框架里的库、`jQuery` 也有封装好的方法。但如果让你用原生的`js`
> 去实现，该怎么做？

这就是考察你的动手能力，以及框架原理的掌握。如果能写出来，可以体现出你的基本功。是加分项。

4.  **跨域通信** 的几种方式

> 这部分非常重要。无非就是问你：什么是跨域、跨域有什么限制、**跨域有几种方式**
> 。

下面分别讲解。

### [\#](#_2-同源策略的概念和具体限制){.header-anchor} 2 同源策略的概念和具体限制 {#_2-同源策略的概念和具体限制}

> **同源策略**
> ：限制从一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的关键的安全机制。（来自MDN官方的解释）

**具体解释：**

1.  `源` 包括三个部分：协议、域名、端口（`http` 协议的默认端口是`80`
    ）。如果有任何一个部分不同，则`源` 不同，那就是跨域了。
2.  `限制`
    ：这个源的文档没有权利去操作另一个源的文档。这个限制体现在：（要记住）

-   `Cookie` 、`LocalStorage` 和`IndexDB` 无法获取。
-   无法获取和操作`DOM` 。
-   不能发送`Ajax` 请求。我们要注意，`Ajax` 只适合**同源** 的通信。

### [\#](#_3-前后端如何通信){.header-anchor} 3 前后端如何通信 {#_3-前后端如何通信}

**主要有以下几种方式：**

-   `Ajax` ：不支持跨域。
-   `WebSocket` ：不受同源策略的限制，支持跨域
-   `CORS`
    ：不受同源策略的限制，支持跨域。一种新的通信协议标准。可以理解成是：**同时支持同源和跨域的Ajax**
    。

### [\#](#_4-如何创建ajax){.header-anchor} 4 如何创建Ajax {#_4-如何创建ajax}

> 在回答 `Ajax` 的问题时，要回答以下几个方面：

1.  `XMLHttpRequest` 的工作原理
2.  兼容性处理

> `XMLHttpRequest`
> 只有在高级浏览器中才支持。在回答问题时，这个兼容性问题不要忽略。

3.  事件的触发条件
4.  事件的触发顺序

> `XMLHttpRequest` 有很多触发事件，每个事件是怎么触发的。

#### [\#](#_4-1-发送-ajax-请求的五个步骤-xmlhttprequest的工作原理){.header-anchor} 4.1 发送 Ajax 请求的五个步骤（XMLHttpRequest的工作原理） {#_4-1-发送-ajax-请求的五个步骤-xmlhttprequest的工作原理}

1.  创建`XMLHttpRequest` 对象。
2.  使用`open` 方法设置请求的参数。`open(method, url, 是否异步)`
3.  发送请求。
4.  注册事件。 注册`onreadystatechange` 事件，状态改变时就会调用。

> 如果要在数据完整请求回来的时候才调用，我们需要手动写一些判断的逻辑。

5.  获取返回的数据，更新UI。

#### [\#](#_4-2-发送-get-请求和-post-请求){.header-anchor} 4.2 发送 get 请求和 post 请求 {#_4-2-发送-get-请求和-post-请求}

> `get` 请求举例：

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

                                    >



                                        <
                                        title

                                    >

                                Document


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
                                        h1

                                    >

                                Ajax 发送 get 请求


                                        </
                                        h1

                                    >



                                        <
                                        input

                                    type

                                        =
                                        "
                                        button"

                                    value

                                        =
                                        "
                                        发送get_ajax请求"

                                    id

                                        =
                                        '
                                        btnAjax'

                                    >



                                        <
                                        script

                                    type

                                        =
                                        "
                                        text/javascript"

                                    >



                                        // 绑定点击事件
                                        document.
                                        querySelector
                                        (
                                        '#btnAjax'
                                        )
                                        .
                                        onclick
                                        =
                                        function
                                        (
                                        )
                                        {
                                        // 发送ajax 请求 需要 五步
                                        // （1）创建异步对象
                                        var
                                        ajaxObj =
                                        new
                                        XMLHttpRequest
                                        (
                                        )
                                        ;
                                        // （2）设置请求的参数。包括：请求的方法、请求的url。
                                        ajaxObj.
                                        open
                                        (
                                        'get'
                                        ,
                                        '02-ajax.php'
                                        )
                                        ;
                                        // （3）发送请求
                                        ajaxObj.
                                        send
                                        (
                                        )
                                        ;
                                        //（4）注册事件。 onreadystatechange事件，状态改变时就会调用。
                                        //如果要在数据完整请求回来的时候才调用，我们需要手动写一些判断的逻辑。
                                        ajaxObj.
                                        onreadystatechange
                                        =
                                        function
                                        (
                                        )
                                        {
                                        // 为了保证 数据 完整返回，我们一般会判断 两个值
                                        if
                                        (
                                        ajaxObj.
                                        readyState ==
                                        4
                                        &&
                                        ajaxObj.
                                        status ==
                                        200
                                        )
                                        {
                                        // 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
                                        // 5.在注册的事件中 获取 返回的 内容 并修改页面的显示
                                        console.
                                        log
                                        (
                                        '数据返回成功'
                                        )
                                        ;
                                        // 数据是保存在 异步对象的 属性中
                                        console.
                                        log
                                        (
                                        ajaxObj.
                                        responseText)
                                        ;
                                        // 修改页面的显示
                                        document.
                                        querySelector
                                        (
                                        'h1'
                                        )
                                        .
                                        innerHTML =
                                        ajaxObj.
                                        responseText;
                                        }
                                        }
                                        }




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

> `post` 请求举例：

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

                                    >



                                        <
                                        title

                                    >

                                Document


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
                                        h1

                                    >

                                Ajax 发送 get 请求


                                        </
                                        h1

                                    >



                                        <
                                        input

                                    type

                                        =
                                        "
                                        button"

                                    value

                                        =
                                        "
                                        发送put_ajax请求"

                                    id

                                        =
                                        '
                                        btnAjax'

                                    >



                                        <
                                        script

                                    type

                                        =
                                        "
                                        text/javascript"

                                    >



                                        // 异步对象
                                        var
                                        xhr =
                                        new
                                        XMLHttpRequest
                                        (
                                        )
                                        ;
                                        // 设置属性
                                        xhr.
                                        open
                                        (
                                        'post'
                                        ,
                                        '02.post.php'
                                        )
                                        ;
                                        // 如果想要使用post提交数据,必须添加此行
                                        xhr.
                                        setRequestHeader
                                        (
                                        "Content-type "
                                        ,
                                        "application/x-www-form-urlencoded "
                                        )
                                        ;
                                        // 将数据通过send方法传递
                                        xhr.
                                        send
                                        (
                                        'name=fox &age=18'
                                        )
                                        ;
                                        // 发送并接受返回值
                                        xhr.
                                        onreadystatechange
                                        =
                                        function
                                        (
                                        )
                                        {
                                        // 这步为判断服务器是否正确响应
                                        if
                                        (
                                        xhr.
                                        readyState ==
                                        4
                                        &&
                                        xhr.
                                        status ==
                                        200
                                        )
                                        {
                                        alert
                                        (
                                        xhr.
                                        responseText)
                                        ;
                                        }
                                        }
                                        ;




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

#### [\#](#_4-3-onreadystatechange-事件){.header-anchor} 4.3 onreadystatechange 事件 {#_4-3-onreadystatechange-事件}

> 注册 `onreadystatechange` 事件后，每当 `readyState`
> 属性改变时，就会调用 `onreadystatechange` 函数。

> `readyState` ：（存有 `XMLHttpRequest` 的状态。从 `0` 到 `4`
> 发生变化）

-   `0` : 请求未初始化
-   `1` : 服务器连接已建立
-   `2` : 请求已接收
-   `3` : 请求处理中
-   `4` : 请求已完成，且响应已就绪

#### [\#](#_4-4-事件的触发条件){.header-anchor} 4.4 事件的触发条件 {#_4-4-事件的触发条件}

#### [\#](#_4-5-事件的触发顺序){.header-anchor} 4.5 事件的触发顺序 {#_4-5-事件的触发顺序}

#### [\#](#_4-6-实际开发中用的-原生ajax请求){.header-anchor} 4.6 实际开发中用的 原生Ajax请求 {#_4-6-实际开发中用的-原生ajax请求}

::: {.language-javascript .extra-class}
``` language-javascript

                                var
                                util =
                                {
                                }
                                ;
                                //获取 ajax 请求之后的json
                                util.
                                json
                                =
                                function
                                (
                                options
                                )
                                {
                                var
                                opt =
                                {
                                url
                                :
                                ''
                                ,
                                type
                                :
                                'get'
                                ,
                                data
                                :
                                {
                                }
                                ,
                                success
                                :
                                function
                                (
                                )
                                {
                                }
                                ,
                                error
                                :
                                function
                                (
                                )
                                {
                                }
                                ,
                                }
                                ;
                                util.
                                extend
                                (
                                opt,
                                options)
                                ;
                                if
                                (
                                opt.
                                url)
                                {
                                //IE兼容性处理：浏览器特征检查。检查该浏览器是否存在XMLHttpRequest这个api，没有的话，就用IE的api
                                var
                                xhr =
                                XMLHttpRequest ?
                                new
                                XMLHttpRequest
                                (
                                )
                                :
                                new

                                    window.
                                    ActiveXObject

                                (
                                'Microsoft.XMLHTTP'
                                )
                                ;
                                var
                                data =
                                opt.
                                data,
                                url =
                                opt.
                                url,
                                type =
                                opt.
                                type.
                                toUpperCase
                                (
                                )
                                ;
                                dataArr =
                                [
                                ]
                                ;
                                }
                                for
                                (
                                var
                                key in
                                data)
                                {
                                dataArr.
                                push
                                (
                                key +
                                '='
                                +
                                data[
                                key]
                                )
                                ;
                                }
                                if
                                (
                                type ===
                                'GET'
                                )
                                {
                                url =
                                url +
                                '?'
                                +
                                dataArr.
                                join
                                (
                                '&'
                                )
                                ;
                                xhr.
                                open
                                (
                                type,
                                url.
                                replace
                                (

                                    /
                                    \?$
                                    /
                                    g

                                ,
                                ''
                                )
                                ,
                                true
                                )
                                ;
                                xhr.
                                send
                                (
                                )
                                ;
                                }
                                if
                                (
                                type ===
                                'POST'
                                )
                                {
                                xhr.
                                open
                                (
                                type,
                                url,
                                true
                                )
                                ;
                                // 如果想要使用post提交数据,必须添加此行
                                xhr.
                                setRequestHeader
                                (
                                "Content-type "
                                ,
                                "application/x-www-form-urlencoded "
                                )
                                ;
                                xhr.
                                send
                                (
                                dataArr.
                                join
                                (
                                '&'
                                )
                                )
                                ;
                                }
                                xhr.
                                onload
                                =
                                function
                                (
                                )
                                {
                                if
                                (
                                xhr.
                                status ===
                                200
                                ||
                                xhr.
                                status ===
                                304
                                )
                                {
                                //304表示：用缓存即可。206表示获取媒体资源的前面一部分
                                var
                                res;
                                if
                                (
                                opt.
                                success &&
                                opt.
                                success instanceof
                                Function
                                )
                                {
                                res =
                                xhr.
                                responseText;
                                if
                                (
                                typeof
                                res ===
                                'string'
                                )
                                {
                                res =
                                JSON
                                .
                                parse
                                (
                                res)
                                ;
                                //将字符串转成json
                                opt.
                                success
                                .
                                call
                                (
                                xhr,
                                res)
                                ;
                                }
                                }
                                }
                                else
                                {
                                if
                                (
                                opt.
                                error &&
                                opt.
                                error instanceof
                                Function
                                )
                                {
                                opt.
                                error
                                .
                                call
                                (
                                xhr,
                                res)
                                ;
                                }
                                }
                                }
                                ;
                                }


```
:::

### [\#](#_5-跨域通信的几种方式){.header-anchor} 5 跨域通信的几种方式 {#_5-跨域通信的几种方式}

> 方式如下：

1.  `JSONP`
2.  `WebSocket`
3.  `CORS`
4.  `Hash`
5.  `postMessage`

> 上面这五种方式，在面试时，都要说出来。

#### [\#](#_5-1-jsonp){.header-anchor} 5.1 JSONP {#_5-1-jsonp}

> 面试会问：`JSONP` 的原理是什么？怎么实现的？

-   在`CORS` 和`postMessage` 以前，我们一直都是通过`JSONP`
    来做跨域通信的。

> **JSONP的原理** ：通过`<script >`
> 标签的异步加载来实现的。比如说，实际开发中，我们发现，`head`
> 标签里，可以通过`<script >` 标签的`src` ，里面放`url`
> ，加载很多在线的插件。这就是用到了`JSONP` 。

**JSONP的实现：**

> 比如说，客户端这样写：

::: {.language-html .extra-class}
``` language-html



                                        <
                                        script

                                    src

                                        =
                                        "
                                        http://www.smyhvae.com/?data=name &callback=myjsonp"

                                    >




                                        </
                                        script

                                    >



```
:::

> 上面的`src` 中，`data=name` 是get请求的参数，`myjsonp`
> 是和后台约定好的函数名。 服务器端这样写：

::: {.language-js .extra-class}
``` language-js

                                myjsonp
                                (
                                {
                                data
                                :
                                {
                                }
                                }
                                )


```
:::

> 于是，本地要求创建一个`myjsonp` 的**全局函数**
> ，才能将返回的数据执行出来。

**实际开发中，前端的JSONP是这样实现的：**

::: {.language-html .extra-class}
``` language-html



                                        <
                                        script

                                    >



                                        var
                                        util =
                                        {
                                        }
                                        ;
                                        //定义方法：动态创建 script 标签
                                        /**
* [function 在页面中注入js脚本]
* @param  {[type]} url     [description]
* @param  {[type]} charset [description]
* @return {[type]}         [description]
*/
                                        util.
                                        createScript
                                        =
                                        function
                                        (

                                            url,
                                            charset

                                        )
                                        {
                                        var
                                        script =
                                        document.
                                        createElement
                                        (
                                        'script'
                                        )
                                        ;
                                        script.
                                        setAttribute
                                        (
                                        'type'
                                        ,
                                        'text/javascript'
                                        )
                                        ;
                                        charset &&
                                        script.
                                        setAttribute
                                        (
                                        'charset'
                                        ,
                                        charset)
                                        ;
                                        script.
                                        setAttribute
                                        (
                                        'src'
                                        ,
                                        url)
                                        ;
                                        script.
                                        async =
                                        true
                                        ;
                                        return
                                        script;
                                        }
                                        ;
                                        /**
* [function 处理jsonp]
* @param  {[type]} url      [description]
* @param  {[type]} onsucess [description]
* @param  {[type]} onerror  [description]
* @param  {[type]} charset  [description]
* @return {[type]}          [description]
*/
                                        util.
                                        jsonp
                                        =
                                        function
                                        (

                                            url,
                                            onsuccess,
                                            onerror,
                                            charset

                                        )
                                        {
                                        var
                                        callbackName =
                                        util.
                                        getName
                                        (
                                        'tt_player'
                                        )
                                        ;
                                        //事先约定好的 函数名
                                        window[
                                        callbackName]
                                        =
                                        function
                                        (
                                        )
                                        {
                                        //根据回调名称注册一个全局的函数
                                        if
                                        (
                                        onsuccess &&
                                        util.
                                        isFunction
                                        (
                                        onsuccess)
                                        )
                                        {
                                        onsuccess
                                        (
                                        arguments[
                                        0
                                        ]
                                        )
                                        ;
                                        }
                                        }
                                        ;
                                        var
                                        script =
                                        util.
                                        createScript
                                        (
                                        url +
                                        '&callback='
                                        +
                                        callbackName,
                                        charset)
                                        ;
                                        //动态创建一个script标签
                                        script.
                                        onload =
                                        script.
                                        onreadystatechange
                                        =
                                        function
                                        (
                                        )
                                        {
                                        //监听加载成功的事件，获取数据
                                        if
                                        (
                                        !
                                        script.
                                        readyState ||

                                            /
                                            loaded|complete
                                            /

                                        .
                                        test
                                        (
                                        script.
                                        readyState)
                                        )
                                        {
                                        script.
                                        onload =
                                        script.
                                        onreadystatechange =
                                        null
                                        ;
                                        // 移除该script的 DOM 对象
                                        if
                                        (
                                        script.
                                        parentNode)
                                        {
                                        script.
                                        parentNode.
                                        removeChild
                                        (
                                        script)
                                        ;
                                        }
                                        // 删除函数或变量
                                        window[
                                        callbackName]
                                        =
                                        null
                                        ;
                                        //最后不要忘了删除
                                        }
                                        }
                                        ;
                                        script.
                                        onerror
                                        =
                                        function
                                        (
                                        )
                                        {
                                        if
                                        (
                                        onerror &&
                                        util.
                                        isFunction
                                        (
                                        onerror)
                                        )
                                        {
                                        onerror
                                        (
                                        )
                                        ;
                                        }
                                        }
                                        ;
                                        document.
                                        getElementsByTagName
                                        (
                                        'head'
                                        )
                                        [
                                        0
                                        ]
                                        .
                                        appendChild
                                        (
                                        script)
                                        ;
                                        //往html中增加这个标签，目的是把请求发送出去
                                        }
                                        ;




                                        </
                                        script

                                    >



```
:::

#### [\#](#_5-2-websocket){.header-anchor} 5.2 WebSocket {#_5-2-websocket}

> `WebSocket` 的用法如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                //
                                var
                                ws =
                                new
                                WebSocket
                                (
                                'wss://echo.websocket.org'
                                )
                                ;
                                //创建WebSocket的对象。参数可以是 ws 或 wss，后者表示加密。
                                //把请求发出去
                                ws.
                                onopen
                                =
                                function
                                (
                                evt
                                )
                                {
                                console.
                                log
                                (
                                'Connection open ...'
                                )
                                ;
                                ws.
                                send
                                (
                                'Hello WebSockets!'
                                )
                                ;
                                }
                                ;
                                //对方发消息过来时，我接收
                                ws.
                                onmessage
                                =
                                function
                                (
                                evt
                                )
                                {
                                console.
                                log
                                (
                                'Received Message: '
                                ,
                                evt.
                                data)
                                ;
                                ws.
                                close
                                (
                                )
                                ;
                                }
                                ;
                                //关闭连接
                                ws.
                                onclose
                                =
                                function
                                (
                                evt
                                )
                                {
                                console.
                                log
                                (
                                'Connection closed.'
                                )
                                ;
                                }
                                ;


```
:::

> 面试一般不会让你写这个代码，一般是考察你是否了解 `WebSocket`
> 概念，知道有这么回事即可。

#### [\#](#_5-3-cors){.header-anchor} 5.3 CORS {#_5-3-cors}

> `CORS` 可以理解成是**既可以同步、也可以异步** 的Ajax。

-   fetch`是一个比较新的` API`，用来实现` CORS\`通信。用法如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                // url（必选），options（可选）
                                fetch
                                (
                                '/some/url/'
                                ,
                                {
                                method
                                :
                                'get'
                                ,
                                }
                                )
                                .
                                then
                                (
                                function
                                (
                                response
                                )
                                {
                                //类似于 ES6中的promise
                                }
                                )
                                .
                                catch
                                (
                                function
                                (
                                err
                                )
                                {
                                // 出错了，等价于 then 的第二个参数，但这样更好用更直观
                                }
                                )
                                ;


```
:::

> 另外，如果面试官问："CORS为什么支持跨域的通信？"

> 答案：跨域时，浏览器会拦截`Ajax` 请求，并在`http` 头中加`Origin` 。

#### [\#](#_5-4-hash){.header-anchor} 5.4 Hash {#_5-4-hash}

-   `url` 的`#` 后面的内容就叫`Hash` 。**Hash的改变，页面不会刷新**
    。这就是用 `Hash` 做跨域通信的基本原理。

> 补充：`url` 的`?` 后面的内容叫`Search` 。`Search`
> 的改变，会导致页面刷新，因此不能做跨域通信。

**使用举例：**

**场景** ：我的页面 `A` 通过`iframe` 或`frame` 嵌入了跨域的页面 `B` 。

> 现在，我这个`A` 页面想给`B` 页面发消息，怎么操作呢？

1.  首先，在我的`A` 页面中：

::: {.language-javascript .extra-class}
``` language-javascript

                                //伪代码
                                var
                                B
                                =
                                document.
                                getElementsByTagName
                                (
                                'iframe'
                                )
                                ;
                                B
                                .
                                src =
                                B
                                .
                                src +
                                '#'
                                +
                                'jsonString'
                                ;
                                //我们可以把JS 对象，通过 JSON.stringify()方法转成 json字符串，发给 B


```
:::

2.  然后，在`B` 页面中：

::: {.language-js .extra-class}
``` language-js

                                // B中的伪代码
                                window.
                                onhashchange
                                =
                                function
                                (
                                )
                                {
                                //通过onhashchange方法监听，url中的 hash 是否发生变化
                                var
                                data =
                                window.
                                location.
                                hash;
                                }
                                ;


```
:::

#### [\#](#_5-5-postmessage-方法){.header-anchor} 5.5 postMessage()方法 {#_5-5-postmessage-方法}

> `H5` 中新增的`postMessage()`
> 方法，可以用来做跨域通信。既然是H5中新增的，那就一定要提到。

**场景** ：窗口 A (`http:A.com` )向跨域的窗口 B (`http:B.com`
)发送信息。步骤如下

1.  在`A` 窗口中操作如下：向`B` 窗口发送数据：

::: {.language-javascript .extra-class}
``` language-javascript

                                // 窗口A(http:A.com)向跨域的窗口B(http:B.com)发送信息
                                Bwindow.
                                postMessage
                                (
                                'data'
                                ,
                                'http://B.com'
                                )
                                ;
                                //这里强调的是B窗口里的window对象


```
:::

2.  在`B` 窗口中操作如下：

::: {.language-javascript .extra-class}
``` language-javascript

                                // 在窗口B中监听 message 事件
                                Awindow.
                                addEventListener
                                (
                                'message'
                                ,
                                function
                                (
                                event
                                )
                                {
                                //这里强调的是A窗口里的window对象
                                console.
                                log
                                (
                                event.
                                origin)
                                ;
                                //获取 ：url。这里指：http://A.com
                                console.
                                log
                                (
                                event.
                                source)
                                ;
                                //获取：A window对象
                                console.
                                log
                                (
                                event.
                                data)
                                ;
                                //获取传过来的数据
                                }
                                ,
                                false
                                )
                                ;


```
:::

## [\#](#九、前端错误监控){.header-anchor} 九、前端错误监控 {#九、前端错误监控}

### [\#](#_1-前言-4){.header-anchor} 1 前言 {#_1-前言-4}

> 错误监控包含的内容是：

-   前端错误的分类
-   每种错误的捕获方式
-   上报错误的基本原理

> 面试时，可能有两种问法：

-   如何监测 `js` 错误？（开门见山的方式）
-   如何保证**产品质量** ？（其实问的也是错误监控）

### [\#](#_2-前端错误的分类){.header-anchor} 2 前端错误的分类 {#_2-前端错误的分类}

包括两种：

-   即时运行错误（代码错误）
-   资源加载错误

### [\#](#_3-每种错误的捕获方式){.header-anchor} 3 每种错误的捕获方式 {#_3-每种错误的捕获方式}

#### [\#](#_3-1-即时运行错误的捕获方式){.header-anchor} 3.1 即时运行错误的捕获方式 {#_3-1-即时运行错误的捕获方式}

**方式1** ：`try ... catch` 。

> 这种方式要部署在代码中。

**方式2：** `window.onerror` 函数。这个函数是全局的。

::: {.language-js .extra-class}
``` language-js

                                window.
                                onerror
                                =
                                function
                                (

                                    msg,
                                    url,
                                    row,
                                    col,
                                    error

                                )
                                {
                                ...
                                }


```
:::

> 参数解释：

-   `msg` 为异常基本信息
-   `source` 为发生异常`Javascript` 文件的`url`
-   `row` 为发生错误的行号

> 方式二中的`window.onerror`
> 是属于DOM0的写法，我们也可以用DOM2的写法：`window.addEventListener("error ", fn);`
> 也可以。

**问题延伸1：**

`window.onerror` 默认无法捕获**跨域** 的`js`
运行错误。捕获出来的信息如下：（基本属于无效信息）

> 比如说，我们的代码想引入`B` 网站的`b.js` 文件，怎么捕获它的异常呢？

**解决办法** ：在方法二的基础之上，做如下操作：

1.  在`b.js` 文件里，加入如下 `response` `header`
    ，表示允许跨域：（或者世界给静态资源`b.js` 加这个 response header）

::: {.language-js .extra-class}
``` language-js

                                Access-
                                Control-
                                Allow-
                                Origin:
                                *


```
:::

2.  引入第三方的文件`b.js` 时，在`<script >` 标签中增加`crossorigin`
    属性；

**问题延伸2：**

> 只靠方式二中的`window.onerror`
> 是不够的，因为我们无法获取文件名是什么，不知道哪里出了错误。解决办法：把**堆栈**
> 信息作为msg打印出来，堆栈里很详细。

#### [\#](#_3-2-资源加载错误的捕获方式){.header-anchor} 3.2 资源加载错误的捕获方式 {#_3-2-资源加载错误的捕获方式}

> 上面的`window.onerror`
> 只能捕获即时运行错误，无法捕获资源加载错误。原理是：资源加载错误，并不会向上冒泡，`object.onerror`
> 捕获后就会终止（不会冒泡给`window` ），所以`window.onerror`
> 并不能捕获资源加载错误。

-   **方式1** ：`object.onerror` 。`img` 标签、`script`
    标签等节点都可以添加`onerror` 事件，用来捕获资源加载的错误。
-   **方式2**
    ：performance.getEntries。可以获取所有已加载资源的加载时长，通过这种方式，可以间接的拿到没有加载的资源错误。

举例：

> 浏览器打开一个网站，在`Console` 控制台下，输入：

::: {.language-js .extra-class}
``` language-js

                                performance.
                                getEntries
                                (
                                )
                                .
                                forEach
                                (
                                function
                                (
                                item
                                )
                                {
                                console.
                                log
                                (
                                item.
                                name)
                                }
                                )


```
:::

或者输入：

::: {.language-js .extra-class}
``` language-js

                                performance.
                                getEntries
                                (
                                )
                                .
                                forEach
                                (
                                item
                                =>
                                {
                                console.
                                log
                                (
                                item.
                                name)
                                }
                                )


```
:::

> 上面这个`api` ，返回的是数组，既然是数组，就可以用`forEach`
> 遍历。打印出来的资源就是**已经成功加载** 的资源。；

> 再入`document.getElementsByTagName('img')`
> ，就会显示出所有**需要加载** 的的img集合。

> 于是，`document.getElementsByTagName('img')`
> 获取的资源数组减去通过`performance.getEntries()`
> 获取的资源数组，剩下的就是没有成功加载的，这种方式可以间接捕获到资源加载错误。

这种方式非常有用，一定要记住。

\*\*方式3；\*\*Error事件捕获。

> 源加载错误，虽然会阻止冒泡，但是不会阻止捕获。我们可以在捕获阶段绑定`error`
> 事件。例如：

> \*\*总结：\*\*如果我们能回答出后面的两种方式，面试官对我们的印象会大大增加。既可以体现出我们对错误监控的了解，还可以体现出我们对事件模型的掌握。

### [\#](#_4-错误上报的两种方式){.header-anchor} 4 错误上报的两种方式 {#_4-错误上报的两种方式}

-   **方式一**
    ：采用Ajax通信的方式上报（此方式虽然可以上报错误，但是我们并不采用这种方式）
-   \*\*方式二：\*\*利用Image对象上报（推荐。网站的监控体系都是采用的这种方式）

> 方式二的实现方式如下：

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

                                    >



                                        <
                                        title

                                    >

                                Title


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
                                        script

                                    >



                                        //通过Image对象进行错误上报
                                        (
                                        new
                                        Image
                                        (
                                        )
                                        )
                                        .
                                        src =
                                        'http://blog.com/myPath?badjs=msg'
                                        ;
                                        // myPath表示上报的路径（我要上报到哪里去）。后面的内容是自己加的参数。




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

> 打开浏览器，效果如下：

上图中，红色那一栏表明，我的请求已经发出去了。点进去看看：

> 这种方式，不需要借助第三方的库，一行代码即可搞定。

## [\#](#十、http协议){.header-anchor} 十、HTTP协议 {#十、http协议}

> 一面中，如果有笔试，考HTTP协议的可能性较大。

### [\#](#_1-前言-5){.header-anchor} 1 前言 {#_1-前言-5}

一面要讲的内容：

-   `HTTP` 协议的主要特点
-   `HTTP` 报文的组成部分
-   `HTTP` 方法
-   `get` 和 `post` 的区别
-   `HTTP` 状态码
-   什么是持久连接
-   什么是管线化

二面要讲的内容；

-   缓存
-   `CSRF` 攻击

### [\#](#_2-http协议的主要特点){.header-anchor} 2 HTTP协议的主要特点 {#_2-http协议的主要特点}

-   简单快速
-   灵活
-   **无连接**
-   **无状态**

> 通常我们要答出以上四个内容。如果实在记不住，一定要记得后面的两个：**无连接、无状态**
> 。

我们分别来解释一下。

#### [\#](#_2-1-简单快速){.header-anchor} 2.1 简单快速 {#_2-1-简单快速}

> **简单** ：每个资源（比如图片、页面）都通过 url
> 来定位。这都是固定的，在`http`
> 协议中，处理起来也比较简单，想访问什么资源，直接输入url即可。

#### [\#](#_2-2-灵活){.header-anchor} 2.2 灵活 {#_2-2-灵活}

> `http` 协议的头部有一个`数据类型` ，通过`http`
> 协议，就可以完成不同数据类型的传输。

#### [\#](#_2-3-无连接){.header-anchor} 2.3 无连接 {#_2-3-无连接}

> 连接一次，就会断开，不会继续保持连接。

#### [\#](#_2-4-无状态){.header-anchor} 2.4 无状态 {#_2-4-无状态}

> 客户端和服务器端是两种身份。第一次请求结束后，就断开了，第二次请求时，**服务器端并没有记住之前的状态**
> ，也就是说，服务器端无法区分客户端是否为同一个人、同一个身份。

> 有的时候，我们访问网站时，网站能记住我们的账号，这个是通过其他的手段（比如
> `session` ）做到的，并不是`http` 协议能做到的。

### [\#](#_3-http报文的组成部分){.header-anchor} 3 HTTP报文的组成部分 {#_3-http报文的组成部分}

> 在回答此问题时，我们要按照顺序回答：

-   先回答的是，`http` 报文包括：**请求报文** 和**响应报文** 。
-   再回答的是，每个报文包含什么部分。
-   最后回答，每个部分的内容是什么

#### [\#](#_3-1-请求报文包括){.header-anchor} 3.1 请求报文包括： {#_3-1-请求报文包括}

-   请求行：包括请求方法、请求的`url` 、`http` 协议及版本。
-   请求头：一大堆的键值对。
-   **空行**
    指的是：当服务器在解析请求头的时候，如果遇到了空行，则表明，后面的内容是请求体
-   请求体：数据部分。

#### [\#](#_3-2-响应报文包括){.header-anchor} 3.2 响应报文包括： {#_3-2-响应报文包括}

-   状态行：`http` 协议及版本、状态码及状态描述。
-   响应头
-   空行
-   响应体

### [\#](#_4-http方法){.header-anchor} 4 HTTP方法 {#_4-http方法}

包括：

-   `GET` ：获取资源
-   `POST` ：传输资源
-   `put` ：更新资源
-   `DELETE` ：删除资源
-   `HEAD` ：获得报文首部

> `HTTP`
> 方法有很多，但是上面这五个方法，要求在面试时全部说出来，不要漏掉。

-   `get` `和` post\` 比较常见。
-   `put` 和 `delete`
    在实际应用中用的很少。况且，业务中，一般不删除服务器端的资源。
-   `head` 可能偶尔用的到。

### [\#](#_5-get-和-post的区别){.header-anchor} 5 get 和 post的区别 {#_5-get-和-post的区别}

-   区别有很多，如果记不住，面试时，至少要任意答出其中的三四条。
-   有一点要强调，**get是相对不隐私的，而post是相对隐私的** 。

> 我们大概要记住以下几点：

1.  浏览器在回退时，`get` **不会重新请求** ，但是`post`
    会重新请求。【重要】
2.  `get` 请求会被浏览器**主动缓存** ，而`post` 不会。【重要】
3.  `get` 请求的参数，会报**保留** 在浏览器的**历史记录** 里，而`post`
    不会。做业务时要注意。为了防止`CSRF` 攻击，很多公司把`get`
    统一改成了`post` 。
4.  `get` 请求在`url` 中`传递的参数有大小限制，基本是`
    2kb\`，不同的浏览器略有不同。而post没有注意。
5.  `get` 的参数是直接暴露在`url` 上的，相对不安全。而`post`
    是放在请求体中的。

### [\#](#_6-http状态码){.header-anchor} 6 http状态码 {#_6-http状态码}

> `http` 状态码分类：

> 常见的`http` 状态码：

**部分解释** ：

-   `206` 的应用：`range`
    指的是请求的范围，客户端只请求某个大文件里的一部分内容。比如说，如果播放视频地址或音频地址的前面一部分，可以用到`206`
    。
-   `301` ：重定向（永久）。
-   `302` ：重定向（临时）。
-   `304` ：我这个服务器告诉客户端，你已经有缓存了，不需要从我这里取了。

```{=html}
<!-- -->
```
-   `400` 和`401` 用的不多,未授权。`403` 指的是请求被拒绝。`404`
    指的是资源不存在。

### [\#](#_7-持久链接-http长连接){.header-anchor} 7 持久链接/http长连接 {#_7-持久链接-http长连接}

> 如果你能答出持久链接，这是面试官很想知道的一个点。

-   **轮询** ：`http1.0`
    中，客户端每隔很短的时间，都会对服务器发出请求，查看是否有新的消息，只要轮询速度足够快，例如`1`
    秒，就能给人造成交互是实时进行的印象。这种做法是无奈之举，实际上对服务器、客户端双方都造成了大量的性能浪费。
-   **长连接** ：`HTTP1.1` 中，通过使用`Connection:keep-alive`
    进行长连接，。客户端只请求一次，但是服务器会将继续保持连接，当再次请求时，避免了重新建立连接。

> 注意，`HTTP 1.1` 默认进行持久连接。在一次 `TCP` 连接中可以完成多个
> `HTTP` 请求，但是对**每个请求仍然要单独发 header** ，`Keep-Alive`
> 不会永久保持连接，它有一个保持时间，可以在不同的服务器软件（如`Apache`
> ）中设定这个时间。

### [\#](#_8-长连接中的管线化){.header-anchor} 8 长连接中的管线化 {#_8-长连接中的管线化}

> 如果能答出**管线化** ，则属于加分项。

#### [\#](#_8-1-管线化的原理){.header-anchor} 8.1 管线化的原理 {#_8-1-管线化的原理}

> 长连接时，**默认** 的请求这样的：

::: {.language- .extra-class}
``` language-text
                            请求1 -->响应1 -->请求2 -->响应2 -->请求3 -->响应3


```
:::

> 管线化就是，我把现在的请求打包，一次性发过去，你也给我一次响应回来。

#### [\#](#_8-2-管线化的注意事项){.header-anchor} 8.2 管线化的注意事项 {#_8-2-管线化的注意事项}

> 面试时，不会深究管线化。如果真要问你，就回答："我没怎么研究过，准备回去看看\~"
:::

::: readMore-wrapper
[阅读全文]{.readMore}
:::
:::

::: last-updated
[Last Updated:]{.prefix} [10/12/2023, 9:26:06 AM]{.time}
:::

::: page-nav
[ ← [手写篇](/docs/base/handwritten.html){.prev} ]{.prev} [
[其他问题](/docs/base/other-questions.html) → ]{.next}
:::

::: {.location v-4f14edf8=""}
::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,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){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,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){.pic
v-4f14edf8=""}
:::

[](http://nav.poetries.top){target="_blank" v-4f14edf8=""}

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,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){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item style="display:none;" v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABMZJREFUeF7tWk2IHFUQrhpmEcR4EFQwl+DBg4dAUAKKh4hiMCwJGiJGUDK786p7VzaIJhdFzB5UMAYxkMWuN+NGFxQEFY0QFUNyyEGIHjwoKIKelBgQBZVdmHklFXqWtt3d6Tfduw3b/WAPO1O/39SrqlfvIVR8YcX9hxqAOgIqjkC9BSoeAHUSLG0LtFqtG5vN5nsagb1e75H5+fkrZURjaQAYY6YR8ZQ6LSJPWmvnKgUAER0DgBdip2eZWf/f8FVaBNQA1BFQ8S3Qbrd3NRqN87rpnXP3djqdCxueAADK7QPa7fYd6nSn0/m6DOdVp3cSNMbsRsQ3AOAPRDwZRdF8WcarXiJ6GQAeFZGfFxcXxxcWFv72sccbACI6CgCvJJQcY+ZZH6VF0M7MzFyztLT0JgA8NpAnIjuttZd85HsDEATB7SLybVIJItooiiiL4unp6et6vd7dInIzAOifrsuIeBkALjLzP8PktFqtW8fGxt4CgHsStJeYeecw3vT33gCogDiBaehvSwg8wcxHVjOAiNoA8DAAPDjEyA8A4Cwzd1ajM8acR8Rdie8/BYAJZv51QwBQJcaY2wAgGhiCiKejKGqlDTDG7EXEwwBwn6dx50TkpLX24zQfEf2UAJ+ZOfCUvUw+UgQMuCcmJrY0m81ZEdkhIrPpUkZEzwLAi6Map3yI+G4URcv7PAb/EAAcQEQN+1wtdC4A1nKMiCSP42leZl4XW9dFaBAE74jIwSIBAIDnmPmlgmX69wHDDIj3/EfD6Eb5XkT2rZQTRpE14Ck8AojoixESXlYfzjHz/VmJs9AVCkBc6mwWxTlozFol0ldu0QC8H9d6Xzt86LVH2OPDsBZtYQAQ0bUA4NWHj+pEs9ncMjc399eo/Em+TAAYYw4hYrLr0yPshWTdJ6IHAOCzIozKIGM3M38+oAvDcIdzbt8KpXNojzAUgNTo6j86kud4Y8zjiPh2BuNzk4jIE9baBRUUhuE255x2hiutM8y8N9cWICIdXR9YSUhymmuMOYKIx3N7l0GAiBy11r6qpFNTU9v7/f43q9h3xVp7Uy4AlJmIIhHR3n95IeInzHxi8EFZAKj+IAhmnHN60EqvwFr7Q24AMvwoejgqZQtksW1DACgzCeYBYWgSzCp8U5dBDxCq2wjFyVKnPtVthWMQqnsYUgAqfxyO63J1ByKDhFmJkVj8yuN5RJwBgP/d8a/XUJSIujoGF5EPEbHFzH9mrVRpupH7AL0bQMTXEXF7LPQXZt6aVrBOY3F1+PpY1/f9fn+82+3+OAoIIwGQfN6SUPo0M7+2mhEFX4ycQsTppC7n3F2dTudLXxC8AQjDcNw5dyapyGdYWcTVWFxuFeynUg7f4ns75A2AMWYCEXUP6voNAPYz80Vf5IugJ6JnAODqsViXiOyx1p71ke0NQBiGW51zhxFR9/vxKIpWPIv7GJGHNgiCgyLyEAB8N8otkTcAeYxN82oi1c/Keh2iuksDQF+HNBqNr9QI59ydZb0SKQ2A+plc/Uyu4s/kKr8F4suWqy/MRKRlrT1dZIXJKqu0JDg5OXlDo9HQEZpWgf3dbvf3rEYXSVcaAEU6kUdWDUAe9DYDbx0Bm+FXzONDHQF50NsMvJWPgH8BZ+4JX3pL2ngAAAAASUVORK5CYII=){.pic
v-4f14edf8=""}
:::

::: {.el-tooltip .item .item v-4f14edf8=""}
![](data:image/png;base64,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){.pic
v-4f14edf8=""}
:::

[](/docs/base/handwritten.html){.el-tooltip v-4f14edf8=""}

::: {.item v-4f14edf8=""}
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABOxJREFUeF7tmF1oHFUUx89ZF0GXPsSHqhU/HkRstWAtRhAfBJXSWmxBUqWC6Jp77yam1YjUr1Irgl9FttYac89M0gcVP+JDP9AKCq1IUbHti7YaFBGtqIgGlVCI2XtkYAKbuLtnZrKTZN1Z2Kf7v+f+z2/OuXfuILT5D9s8f8gAZBXQ5gSyFmjzAsg2wawFshZocwJZC7R5AWSnQNYCWQu0OYH/dQsYY5Yx8wZmPu553v5az7omAK31cwCwJZjAzEeYeavv+4dbqViqcwh8I+IHzNxNRD9U5/EfAEqpVxCxNDNZZu70PO/zVoCgtbYAoGt4fZeI1tYF0Nvbe+Hk5OQ0QtVi59x5vu//upAhGGO2MvNT9Twi4hXW2pNT49MqoLu7e2UulzsqJHgmEf2zECEope5GxD2NvDUE0NPT01GpVP4QkvuNiBYvNADGmBuZ+UPB1wkiurLhHtCgf6rnHSeilQsFglLqMkT8BADOETxtJ6InJQBnM/NeRLy5UTBm3ud53vr5htDf33/W+Pj4IQC4Vij9AWvtfTM1NY/BcDPcBwArhAR3E9Gm+YSgtX4bALoEDyNEtCHye0AgVEpdhYgBhIuE4FuIaMd8QFBKvYCIDwprfwQA64joz1gAQgg3IeJeACgI5bXRWvvGXELQWj8AAGVhzdFKpbJ2aGjo27rHomTaGHM7M78p6Zh5jed5ByVdM8aVUrch4jtSLES8zlobbI51f5HuAlrrYPPY3YwFpRjSeKlU6nTOfSbpEHG9tTZo4Ya/SADCdtiGiNOOkFqRnXPLfN//Slo4yXixWFySz+d/ijBXEZEfQRfvi5DW+kUA2CwEDjabpUT0cxQDcTRKqW8Q8VJhzuNE9HTUuJErYCqg1vp1ANgoLPBloVDoLJfLp6MakXRa6/cAYLWg20lE/VKs6vHYAILJxpj3mXmVsNBBIloTx0w9rVJqFyJK7xv7iWhd3PUSAQj3hKOIKL0O7yGiYlxT1XpjzCZm3iXEGC0UCiuSVFxiAF1dXWd0dHQE5+slgrkyEUkvKzVDKKVWI2JQ+tLv4pkfOqQJU+OJAQQB+vr6lkxMTHwNAIuEBbcRUd07eq254eesE1IiiHiNtVa6wtcNMysAQVSt9dUAcCyC0c3W2pckXTBeLBYX5fP5vyRtM16+Zg0g3A8ilSoz3+V53qtSYlrr36WrLTPf63nesBRLGm8KgPBkuIeZRUOIeKu19kA9Y1rrT6WrLQA8T0QPS8lFGW8agLAdHgGAZ4SFTzvnVvm+//FMnTHmNWa+U5if6LirF7OpAMJ22ImI9wtJ/AgAtxDRF1M6rfV2AHhCmDdKRJdHebJRNU0HEFZCcDW+QzDxPTO/nMvlTgaf3CMkD2NjY/mRkZFK1OSi6FIBEFbCIUS8IYqJKJp8Pn/+wMDAL1G0cTSpAQgrIfj+vjSOoVraXC53/eDg4JHZxqk1P1UAIQTxSGuUWLOOuznbBGstpLUOSvfcBE+wacfdvAIIFjfG7GDmh2JAeJaIHo2hTyRNvQWqXWmtDQAMNnKKiN8BwGPW2rcSZRRz0pwCCLyVSqXFzLw8+APAckS8wDl3ChFPOecOO+eODQ8P/x0zj8TyOQeQ2GlKEzMAKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaFYBKYFtmbBZBbTMo0rJaNtXwL8uSqVQauCBGgAAAABJRU5ErkJggg==){.pic
style="transform:rotate(90deg);" v-4f14edf8=""}
:::

[](/docs/base/other-questions.html){.el-tooltip v-4f14edf8=""}

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

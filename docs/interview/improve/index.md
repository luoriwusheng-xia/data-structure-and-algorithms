# 进阶篇

<div class='interview-page-container'>

## 一、JS基础

### 1 类型及检测方式

![Alt text](image.png)

JavaScript 的数据类型有下图所示

> 其中，前 7 种类型为基础类型，最后 `1 种（Object）为引用类型`

> ，也是你需要重点关注的，因为它在日常工作中是使用得最频繁，也是需要关注最多技术细节的数据类型

* `JavaScript` 一共有8种数据类型，其中有7种基本数据类型：`Undefined`
  、 `Null` 、 `Boolean` 、 `Number` 、 `String` 、 `Symbol` （ `es6`新增，表示独一无二的值）和 `BigInt` （ `es10` 新增）；
* 1种引用数据类型——`Object`
  （Object本质上是由一组无序的名值对组成的）。里面包含`function、Array、Date`等。JavaScript不支持任何创建自定义类型的机制，而所有值最终都将是上述 8种数据类型之一。
  + **引用数据类型:** 对象`Object` （包含普通对象-`Object`，数组对象- `Array` ，正则对象- `RegExp` ，日期对象- `Date`，数学函数- `Math` ，函数对象- `Function`, `Set`, `Map`, `Symbol` ）

> 在这里，我想先请你重点了解下面两点，因为各种 JavaScript
> 的数据类型最后都会在初始化之后放在不同的内存中，因此上面的数据类型大致可以分成两类来进行存储：

* **原始数据类型**
  ：基础类型存储在栈内存，被引用或拷贝时，会创建一个完全相等的变量；占据空间小、大小固定，属于被频繁使用数据，所以放入栈中存储。
* **引用数据类型**
  ：引用类型存储在堆内存，存储的是地址，多个引用指向同一个地址，这里会涉及一个“共享”的概念；占据空间大、大小不固定。引用数据类型在栈中存储了指针，该指针指向堆中该实体的起始地址。当解释器寻找引用值时，会首先检索其在栈中的地址，取得地址后从堆中获得实体。

**JavaScript 中的数据是如何存储在内存中的？**

> 在 JavaScript
> 中，原始类型的赋值会完整复制变量值，而引用类型的赋值是复制引用地址。

在 JavaScript 的执行过程中， 主要有三种类型内存空间，分别是 `代码空间`、 `栈空间` 、 `堆空间` 。其中的代码空间主要是存储可执行代码的，原始类型( `Number、String、Null、Undefined、Boolean、Symbol、BigInt`)的数据值都是直接保存在“栈”中的，引用类型(Object)的值是存放在“堆”中的。因此在栈空间中(执行上下文)，原始类型存储的是变量的值，而引用类型存储的是其在
"堆空间 "中的地址，当 JavaScript需要访问该数据的时候，是通过栈中的引用地址来访问的，相当于多了一道转手流程。

在编译过程中，如果 JavaScript引擎判断到一个闭包，也会在堆空间创建换一个 `“closure(fn)”` 的对象（这是一个内部对象，JavaScript是无法访问的），用来保存闭包中的变量。所以闭包中的变量是存储在“堆空间”中的。

JavaScript引擎需要用栈来维护程序执行期间上下文的状态，如果栈空间大了话，所有的数据都存放在栈空间里面，那么会影响到上下文切换的效率，进而又影响到整个程序的执行效率。通常情况下，栈空间都不会设置太大，主要用来存放一些原始类型的小数据。而引用类型的数据占用的空间都比较大，所以这一类数据会被存放到堆中，堆空间很大，能存放很多大的数据，不过缺点是分配内存和回收内存都会占用一定的时间。因此需要“栈”和“堆”两种空间。

```javascript
let a = {
    name: 'Julia',
    age: 20
}

function change(o) {
    o.age = 24;
    o = {
        name: 'Kath',
        age: 30
    }
    return o;
}
let b = change(a); // 注意这里没有new，后面new相关会有专门文章讲解
console.log(b.age); // 第一个console
console.log(a.age); // 第二个console
```

这道题涉及了 `function` ，你通过上述代码可以看到第一个 `console`

的结果是 `30` ， `b` 最后打印结果是 `{name: "Kath ", age: 30}` ；第二个
`console` 的返回结果是 `24` ，而 `a` 最后的打印结果是
`{name: "Julia ", age: 24}` 。

是不是和你预想的有些区别？你要注意的是，这里的 `function` 和 `return`

带来了不一样的东西。

> 原因在于：函数传参进来的 `o`

> ，传递的是对象在堆中的内存地址值，通过调用 `o.age = 24` （第 7
> 行代码）确实改变了 `a` 对象的 `age` 属性；但是第 12 行代码的 `return`

> 却又把 `o` 变成了另一个内存地址，将 `{name: "Kath ", age: 30}`

> 存入其中，最后返回 `b` 的值就变成了 `{name: "Kath ", age: 30}`

> 。而如果把第 12 行去掉，那么 `b` 就会返回 `undefined`

**2. 数据类型检测**

**（1）typeof**

> typeof 对于原始类型来说，除了 null 都可以显示正确的类型

```js
console.log(typeof 2); // number
console.log(typeof true); // boolean
console.log(typeof 'str'); // string
console.log(typeof []); // object     []数组的数据类型在 typeof 中被解释为 object
console.log(typeof
    function() {}); // function
console.log(typeof {}); // object
console.log(typeof undefined); // undefined
console.log(typeof null); // object     null 的数据类型被 typeof 解释为 object
```

> `typeof` 对于对象来说，除了函数都会显示 `object` ，所以说 `typeof`

> 并不能准确判断变量到底是什么类型, 所以想判断一个对象的正确类型，这时候可以考虑使用
> `instanceof`

**（2）instanceof**

> `instanceof`

> 可以正确的判断对象的类型，因为内部机制是通过判断对象的原型链中是不是能找到类型的
> `prototype`

```js
// 我们也可以试着实现一下 instanceof
function _instanceof(left, right) {
    // 由于instance要检测的是某对象，需要有一个前置判断条件
    //基本数据类型直接返回false
    if (typeof left !== 'object' || left === null) return false;

    // 获得类型的原型
    let prototype = right.prototype
    // 获得对象的原型
    left = left.__proto__
    // 判断对象的类型是否等于类型的原型
    while (true) {
        if (left === null)
            return false
        if (prototype === left)
            return true
        left = left.__proto__
    }
}

console.log('test', _instanceof(null, Array)) // false
console.log('test', _instanceof([], Array)) // true
console.log('test', _instanceof('', Array)) // false
console.log('test', _instanceof({}, Object)) // true
```

**（3）constructor**

```js
console.log((2).constructor === Number); // true
console.log((true).constructor === Boolean); // true
console.log(('str').constructor === String); // true
console.log(([]).constructor === Array); // true
console.log((function() {}).constructor === Function); // true
console.log(({}).constructor === Object); // true
```

> 这里有一个坑，如果我创建一个对象，更改它的原型， `constructor`

> 就会变得不可靠了

```js
function Fn() {};

Fn.prototype = new Array();

var f = new Fn();

console.log(f.constructor === Fn); // false
console.log(f.constructor === Array); // true
```

**（4）Object.prototype.toString.call()**

> `toString()` 是 `Object` 的原型方法，调用该方法，可以统一返回格式为
> `“[object Xxx]”` 的字符串，其中 `Xxx` 就是对象的类型。对于 `Object`
> 对象，直接调用 `toString()` 就能返回 `[object Object]`
> ；而对于其他对象，则需要通过 `call`
> 来调用，才能返回正确的类型信息。我们来看一下代码。

```js
Object.prototype.toString({})       // "[object Object]"
Object.prototype.toString.call({})  // 同上结果，加上call也ok
Object.prototype.toString.call(1)    // "[object Number]"
Object.prototype.toString.call('1')  // "[object String]"
Object.prototype.toString.call(true)  // "[object Boolean]"
Object.prototype.toString.call(function(){})  // "[object Function]"
Object.prototype.toString.call(null)   //"[object Null]"
Object.prototype.toString.call(undefined) //"[object Undefined]"
Object.prototype.toString.call(/123/g)    //"[object RegExp]"
Object.prototype.toString.call(new Date()) //"[object Date]"
Object.prototype.toString.call([])       //"[object Array]"
Object.prototype.toString.call(document)  //"[object HTMLDocument]"
Object.prototype.toString.call(window)   //"[object Window]"
Object.prototype.toString.call(Symbol) // '[object Function]'
Object.prototype.toString.call(Set)  // '[object Function]'
Object.prototype.toString.call(Map)  // '[object Function]'
// 从上面这段代码可以看出，Object.prototype.toString.call() 可以很好地判断引用类型，甚至可以把 document 和 window 都区分开来。

```

> 实现一个全局通用的数据类型判断方法，来加深你的理解，代码如下


```js
function getType(obj){
  let type  = typeof obj;
  if (type !== "object") {    // 先进行typeof判断，如果是基础数据类型，直接返回
    return type;
  }
  // 对于typeof返回结果是object的，再进行如下的判断，正则返回结果
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');  // 注意正则中间有个空格
}
/* 代码验证，需要注意大小写，哪些是typeof判断，哪些是toString判断？思考下 */
getType([])     // "Array" typeof []是object，因此toString返回
getType('123')  // "string" typeof 直接返回
getType(window) // "Window" toString返回
getType(null)   // "Null"首字母大写，typeof null是object，需toString来判断
getType(undefined)   // "undefined" typeof 直接返回
getType()            // "undefined" typeof 直接返回
getType(function(){}) // "function" typeof能判断，因此首字母小写
getType(/123/g)      //"RegExp" toString返回

```

**小结**

- `typeof`
  - 直接在计算机底层基于数据类型的值（二进制）进行检测
  - `typeof null` 为`object` 原因是对象存在在计算机中，都是以`000`
    开始的二进制存储，所以检测出来的结果是对象
  - `typeof` 普通对象/数组对象/正则对象/日期对象 都是`object`
  - `typeof NaN === 'number'`
- `instanceof`
  - 检测当前实例是否属于这个类的
  - 底层机制：只要当前类出现在实例的原型上，结果都是true
  - 不能检测基本数据类型
- `constructor`
  - 支持基本类型
  - constructor可以随便改，也不准
- `Object.prototype.toString.call([val])`
  - 返回当前实例所属类信息

> 判断 `Target` 的类型，单单用 `typeof` 并无法完全满足，这其实并不是
> `bug` ，本质原因是 `JS`
> 的万物皆对象的理论。因此要真正完美判断时，我们需要区分对待:

- 基本类型(`null` ): 使用 `String(null)`
- 基本类型(`string / number / boolean / undefined` ) + `function` : -
  直接使用 `typeof` 即可
- 其余引用类型(`Array / Date / RegExp Error` ): 调用`toString`
  后根据`[object XXX]` 进行判断

#### 3. 数据类型转换

我们先看一段代码，了解下大致的情况。


```js
'123' == 123   // true
'' == null    // false
'' == 0        // true
[] == 0        // true
[] == ''       // true
[] == ![]      // true
null == undefined //  true
Number(null)     // 返回 0
Number('')      // 返回0
parseInt('');    // 返回 NaN
{}+10           // 返回 10

let obj = {
    [Symbol.toPrimitive]() {
        return 200;
    },
    valueOf() {
        return 300;
    },
    toString() {
        return 'Hello';
    }
}
console.log(obj + 200); // 这里打印出来是多少？
```


> 首先我们要知道，在 `JS` 中类型转换只有三种情况，分别是：

- 转换为布尔值
- 转换为数字
- 转换为字符串

![Alt text](image-1.png)

##### 转Boolean

> 在条件判断时，除了 `undefined` ，`null` ， `false` ， `NaN` ， `''` ，
> `0` ， `-0` ，其他所有值都转为 `true` ，包括所有对象


```js
Boolean(0)          //false
Boolean(null)       //false
Boolean(undefined)  //false
Boolean(NaN)        //false
Boolean(1)          //true
Boolean(13)         //true
Boolean('12')       //true
```

##### 对象转原始类型

> 对象在转换类型的时候，会调用内置的 `[[ToPrimitive]]`
> 函数，对于该函数来说，算法逻辑一般来说如下

- 如果已经是原始类型了，那就不需要转换了
- 调用 `x.valueOf()` ，如果转换为基础类型，就返回转换的值
- 调用 `x.toString()` ，如果转换为基础类型，就返回转换的值
- 如果都没有返回原始类型，就会报错

> 当然你也可以重写 `Symbol.toPrimitive`
> ，该方法在转原始类型时调用优先级最高。



##### 四则运算符

> 它有以下几个特点：

- 运算中其中一方为字符串，那么就会把另一方也转换为字符串
- 如果一方不是字符串或者数字，那么会将它转换为数字或者字符串

- 对于第一行代码来说，触发特点一，所以将数字 `1` 转换为字符串，得到结果
  `'11'`
- 对于第二行代码来说，触发特点二，所以将 `true` 转为数字 `1`
- 对于第三行代码来说，触发特点二，所以将数组通过 `toString` 转为字符串
  `1,2,3` ，得到结果 `41,2,3`

> 另外对于加法还需要注意这个表达式 `'a' + + 'b'`




- 因为 `+ 'b'` 等于 `NaN` ，所以结果为 `"aNaN "`
  ，你可能也会在一些代码中看到过 `+ '1'` 的形式来快速获取 `number`
  类型。
- 那么对于除了加法的运算符来说，只要其中一方是数字，那么另一方就会被转为数字




##### 比较运算符

- 如果是对象，就通过 `toPrimitive` 转换对象
- 如果是字符串，就通过 `unicode` 字符索引来比较



> 在以上代码中，因为 `a` 是对象，所以会通过 `valueOf`
> 转换为原始类型再比较值。


##### 强制类型转换

> 强制类型转换方式包括 `Number()` 、`parseInt()` 、`parseFloat()`
> 、`toString()` 、`String()` 、`Boolean()` ，这几种方法都比较类似

- `Number()` 方法的强制转换规则
- 如果是布尔值，`true` 和 `false` 分别被转换为 `1` 和 `0` ；
- 如果是数字，返回自身；
- 如果是 `null` ，返回 `0` ；
- 如果是 `undefined` ，返回 `NaN` ；
- 如果是字符串，遵循以下规则：如果字符串中只包含数字（或者是 `0X / 0x`
  开头的十六进制数字字符串，允许包含正负号），则将其转换为十进制；如果字符串中包含有效的浮点格式，将其转换为浮点数值；如果是空字符串，将其转换为
  `0` ；如果不是以上格式的字符串，均返回 NaN；
- 如果是 `Symbol` ，抛出错误；
- 如果是对象，并且部署了 `[Symbol.toPrimitive]`
  ，那么调用此方法，否则调用对象的 `valueOf()`
  方法，然后依据前面的规则转换返回的值；如果转换的结果是 `NaN`
  ，则调用对象的 `toString()` 方法，再次依照前面的顺序转换返回对应的值。




**Object 的转换规则**

> 对象转换的规则，会先调用内置的 `[ToPrimitive]` 函数，其规则逻辑如下：

- 如果部署了 `Symbol.toPrimitive` 方法，优先调用再返回；
- 调用 `valueOf()` ，如果转换为基础类型，则返回；
- 调用 `toString()` ，如果转换为基础类型，则返回；
- 如果都没有返回基础类型，会报错。



**'==' 的隐式类型转换规则**

- 如果类型相同，无须进行类型转换；
- 如果其中一个操作值是 `null` 或者 `undefined` ，那么另一个操作符必须为`null` 或者 `undefined` ，才会返回 `true` ，否则都返回 `false` ；
- 如果其中一个是 `Symbol` 类型，那么返回 `false` ；
- 两个操作值如果为 `string` 和 number 类型，那么就会将字符串转换为`number` ；
- 如果一个操作值是 `boolean` ，那么转换成 `number` ；
- 如果一个操作值为 `object` 且另一方为 `string` 、`number` 或者 `symbol`，就会把 `object` 转为原始类型再进行判断（调用 `object` 的  `valueOf/toString` 方法进行转换）。


**'+' 的隐式类型转换规则**

> '+' 号操作符，不仅可以用作数字相加，还可以用作字符串拼接。仅当 '+'
> 号两边都是数字时，进行的是加法运算；如果两边都是字符串，则直接拼接，无须进行隐式类型转换。

- 如果其中有一个是字符串，另外一个是 `undefined` 、`null`
  或布尔型，则调用 `toString()`
  方法进行字符串拼接；如果是纯对象、数组、正则等，则默认调用对象的转换方法会存在优先级，然后再进行拼接。
- 如果其中有一个是数字，另外一个是 `undefined` 、`null`
  、布尔型或数字，则会将其转换成数字进行加法运算，对象的情况还是参考上一条规则。
- 如果其中一个是字符串、一个是数字，则按照字符串规则进行拼接



> 整体来看，如果数据中有字符串，JavaScript
> 类型转换还是更倾向于转换成字符串，因为第三条规则中可以看到，在字符串和数字相加的过程中最后返回的还是字符串，这里需要关注一下

**null 和 undefined 的区别？**

- 首先 `Undefined` 和 `Null`
  都是基本数据类型，这两个基本数据类型分别都只有一个值，就是 `undefined`
  和 `null` 。
- `undefined` 代表的含义是未定义， `null`
  代表的含义是空对象（其实不是真的对象，请看下面的注意！）。一般变量声明了但还没有定义的时候会返回
  `undefined` ，`null`
  主要用于赋值给一些可能会返回对象的变量，作为初始化。

> 其实 null 不是对象，虽然 typeof null 会输出 object，但是这只是 JS
> 存在的一个悠久 Bug。在 JS 的最初版本中使用的是 32
> 位系统，为了性能考虑使用低位存储变量的类型信息，000
> 开头代表是对象，然而 null 表示为全零，所以将它错误的判断为 object
> 。虽然现在的内部类型判断代码已经改变了，但是对于这个 Bug
> 却是一直流传下来。

- undefined 在 js 中不是一个保留字，这意味着我们可以使用 `undefined`
  来作为一个变量名，这样的做法是非常危险的，它会影响我们对 undefined
  值的判断。但是我们可以通过一些方法获得安全的 `undefined` 值，比如说
  `void 0` 。
- 当我们对两种类型使用 typeof 进行判断的时候，Null 类型化会返回
  “object”，这是一个历史遗留的问题。当我们使用双等号对两种类型的值进行比较时会返回
  true，使用三个等号时会返回 false。

### 2 This


> 不同情况的调用，`this` 指向分别如何。顺带可以提一下 `es6`
> 中箭头函数没有 `this` , `arguments` , `super`
> 等，这些只依赖包含箭头函数最接近的函数

> 我们先来看几个函数调用的场景

```js
function foo() {
  console.log(this.a)
}
var a = 1
foo()

const obj = {
  a: 2,
  foo: foo
}
obj.foo()

const c = new foo()
```


- 对于直接调用 `foo` 来说，不管 `foo` 函数被放在了什么地方，`this`
  一定是`window`
- 对于 `obj.foo()` 来说，我们只需要记住，谁调用了函数，谁就是 `this`
  ，所以在这个场景下 `foo` 函数中的 `this` 就是 `obj` 对象
- 对于 `new` 的方式来说，`this` 被永远绑定在了 `c`
  上面，不会被任何方式改变 `this`

> 说完了以上几种情况，其实很多代码中的 `this`
> 应该就没什么问题了，下面让我们看看箭头函数中的 `this`


```js
function a() {
  return () => {
    return () => {
      console.log(this)
    }
  }
}
console.log(a()()())

```

- 首先箭头函数其实是没有 `this` 的，箭头函数中的 `this`
  只取决包裹箭头函数的第一个普通函数的 `this`
  。在这个例子中，因为包裹箭头函数的第一个普通函数是 `a` ，所以此时的
  `this` 是 `window` 。另外对箭头函数使用 `bind` 这类函数是无效的。
- 最后种情况也就是 `bind` 这些改变上下文的 `API`
  了，对于这些函数来说，`this`
  取决于第一个参数，如果第一个参数为空，那么就是 `window` 。
- 那么说到 `bind` ，不知道大家是否考虑过，如果对一个函数进行多次 `bind`
  ，那么上下文会是什么呢？

```js
let a = {}
let fn = function () { console.log(this) }
fn.bind().bind(a)() // => ?

```

> 如果你认为输出结果是 `a`
> ，那么你就错了，其实我们可以把上述代码转换成另一种形式

```js
// fn.bind().bind(a) 等于
let fn2 = function fn1() {
  return function() {
    return fn.apply()
  }.apply(a)
}
fn2()

```

> 可以从上述代码中发现，不管我们给函数 `bind` 几次，`fn` 中的 `this`
> 永远由第一次 `bind` 决定，所以结果永远是 `window`


```js
let a = { name: 'poetries' }
function foo() {
  console.log(this.name)
}
foo.bind(a)() // => 'poetries'

```


> 以上就是 `this`的规则了，但是可能会发生多个规则同时出现的情况，这时候不同的规则之间会根据优先级最高的来决定`this` 最终指向哪里。

> 首先，`new` 的方式优先级最高，接下来是 `bind` 这些函数，然后是
> `obj.foo()` 这种调用方式，最后是 `foo` 这种调用方式，同时，箭头函数的
> `this` 一旦被绑定，就不会再被任何方式所改变。

![Alt text](image-2.png)


**函数执行改变this**

- 由于 JS 的设计原理:
  在函数中，可以引用运行环境中的变量。因此就需要一个机制来让我们可以在函数体内部获取当前的运行环境，这便是`this`
  。

> 因此要明白 `this` 指向，其实就是要搞清楚
> 函数的运行环境，说人话就是，谁调用了函数。例如

- `obj.fn()` ，便是 `obj` 调用了函数，既函数中的 `this === obj`
- `fn()` ，这里可以看成 `window.fn()` ，因此 `this === window`

> 但这种机制并不完全能满足我们的业务需求，因此提供了三种方式可以手动修改
> `this` 的指向:

- `call: fn.call(target, 1, 2)`
- `apply: fn.apply(target, [1, 2])`
- `bind: fn.bind(target)(1,2)`

### 3 apply/call/bind 原理

![Alt text](image-3.png)

> `call、apply` 和 `bind` 是挂在 `Function`
> 对象上的三个方法，调用这三个方法的必须是一个函数。

```js
func.call(thisArg, param1, param2, ...)
func.apply(thisArg, [param1,param2,...])
func.bind(thisArg, param1, param2, ...)

```


- 在浏览器里，在全局范围内this 指向window对象；
- 在函数中，this永远指向最后调用他的那个对象；
- 构造函数中，this指向new出来的那个新的对象；
- `call、apply、bind` 中的this被强绑定在指定的那个对象上；
- 箭头函数中this比较特殊,箭头函数this为父作用域的this，不是调用时的this 。 要知道前四种方式,都是调用时确定,也就是动态的,而箭头函数的this指向是静态的,声明的时候就确定了下来；
- `apply、call、bind`
  都是js给函数内置的一些API，调用他们可以为函数指定this的执行,同时也可以传参。

![Alt text](image-4.png)


```js
let a = {
    value: 1
}
function getValue(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value)
}
getValue.call(a, 'poe', '24')
getValue.apply(a, ['poe', '24'])

```


> `bind`和其他两个方法作用也是一致的，只是该方法会返回一个函数。并且我们可以通过
> `bind` 实现柯里化



**方法的应用场景**

> 下面几种应用场景，你多加体会就可以发现它们的理念都是“借用”方法的思路。我们来看看都有哪些。

1.  判断数据类型

> 用 `Object.prototype.toString`
> 来判断类型是最合适的，借用它我们几乎可以判断所有类型的数据


```js
function getType(obj){
  let type  = typeof obj;
  if (type !== "object") {
    return type;
  }
  return Object.prototype.toString.call(obj).replace(/^$/, '$1');
}

```

2.  类数组借用方法

> 类数组因为不是真正的数组，所有没有数组类型上自带的种种方法，所以我们就可以利用一些方法去借用数组的方法，比如借用数组的
> `push` 方法，看下面的一段代码。

```js
var arrayLike = {
  0: 'java',
  1: 'script',
  length: 2
}
Array.prototype.push.call(arrayLike, 'jack', 'lily');
console.log(typeof arrayLike); // 'object'
console.log(arrayLike);
// {0: "java", 1: "script", 2: "jack", 3: "lily", length: 4}

```

> 用 `call` 的方法来借用 `Array 原型链上的 push`
> 方法，可以实现一个`类数组的 push` 方法，给 `arrayLike` 添加新的元素

3.  获取数组的最大 / 最小值

> 我们可以用 apply 来实现数组中判断最大 / 最小值，`apply`
> 直接传递数组作为调用方法的参数，也可以减少一步展开数组，可以直接使用
> `Math.max、Math.min` 来获取数组的最大值 / 最小值，请看下面这段代码。

```js
let arr = [13, 6, 10, 11, 16];
const max = Math.max.apply(Math, arr);
const min = Math.min.apply(Math, arr);

console.log(max);  // 16
console.log(min);  // 6

```

#### 实现一个 bind 函数

对于实现以下几个函数，可以从几个方面思考

- 不传入第一个参数，那么默认为 `window`
- 改变了 `this`
  指向，让新的对象可以执行该函数。那么思路是否可以变成给新的对象添加一个函数，然后在执行完以后删除？

```js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  var _this = this
  var args = [...arguments].slice(1)
  // 返回一个函数
  return function F() {
    // 因为返回了一个函数，我们可以 new F()，所以需要判断
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}

/**
 * 改变say的上下文
 */
function say() {
  console.log(2222)
  console.log('参数---',arguments)
  console.log(this.name)
}

let t = {
  name: '张三'
}

let f = say.myBind(t, 77)

f(1,2,3,4)

// 连着写   say.myBind(t,77)(1,2,3,4)
```

#### 实现一个 call 函数

```js
Function.prototype.myCall = function (context) {
  var context = context || window
  // 给 context 添加一个属性
  // getValue.call(a, 'pp', '24') => a.fn = getValue
  context.fn = this
  // 将 context 后面的参数取出来
  var args = [...arguments].slice(1)
  // getValue.call(a, 'pp', '24') => a.fn('pp', '24')
  var result = context.fn(...args)
  // 删除 fn
  delete context.fn
  return result
}

```

#### 实现一个 apply 函数

```js
Function.prototype.myApply = function(context = window, ...args) {
  // this-->func  context--> obj  args--> 传递过来的参数

  // 在context上加一个唯一值不影响context上的属性
  let key = Symbol('key')
  context[key] = this; // context为调用的上下文,this此处为函数，将这个函数作为context的方法
  // let args = [...arguments].slice(1)   //第一个参数为obj所以删除,伪数组转为数组

  let result = context[key](...args);
  delete context[key]; // 不删除会导致context属性越来越多
  return result;
}
```

```js
// 使用
function f(a,b){
 console.log(a,b)
 console.log(this.name)
}
let obj={
 name:'张三'
}
f.myApply(obj,[1,2])  //arguments[1]

```

### 4 变量提升


> 当执行 `JS`
> 代码时，会生成执行环境，只要代码不是写在函数中的，就是在全局执行环境中，函数中的代码会产生函数执行环境，只此两种执行环境。

```js
b() // call b
console.log(a) // undefined

var a = 'Hello world'

function b() {
    console.log('call b')
}

```

> 想必以上的输出大家肯定都已经明白了，这是因为函数和变量提升的原因。通常提升的解释是说将声明的代码移动到了顶部，这其实没有什么错误，便于大家理解。但是更准确的解释应该是：在生成执行环境时，会有两个阶段。第一个阶段是创建的阶段，`JS`
> 解释器会找出需要提升的变量和函数，并且给他们提前在内存中开辟好空间，函数的话会将整个函数存入内存中，变量只声明并且赋值为 `undefined`
> ，所以在第二个阶段，也就是代码执行阶段，我们可以直接提前使用

- 在提升的过程中，相同的函数会覆盖上一个函数，并且函数优先于变量提升

```js
b() // call b second

function b() {
    console.log('call b fist')
}
function b() {
    console.log('call b second')
}
var b = 'Hello world'

```

> `var` 会产生很多错误，所以在 ES6中引入了 `let` 。`let`
> 不能在声明前使用，但是这并不是常说的 `let` 不会提升，`let`
> 提升了，在第一阶段内存也已经为他开辟好了空间，但是因为这个声明的特性导致了并不能在声明前使用


### 5 执行上下文


> 当执行 JS 代码时，会产生三种执行上下文

- 全局执行上下文
- 函数执行上下文
- `eval` 执行上下文

> 每个执行上下文中都有三个重要的属性

- 变量对象（`VO`
  ），包含变量、函数声明和函数的形参，该属性只能在全局上下文中访问
- 作用域链（`JS`
  采用词法作用域，也就是说变量的作用域是在定义时就决定了）
- `this`


```js
var a = 10
function foo(i) {
  var b = 20
}
foo()

```

> 对于上述代码，执行栈中有两个上下文：全局上下文和函数 foo 上下文。

</div>

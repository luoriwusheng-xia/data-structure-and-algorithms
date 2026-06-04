# lodash源码分析

分析的版本是 lodash@4.17

### 匿名函数

```javascript
;
(function() {
    ...其他代码

}.call(this));
```

### 环境确定 window/node

确定 当前环境， node 环境还是 window环境

```javascript
...
/** Detect free variable `global` from Node.js. */
// node环境全局变量就是 global, 且 global.Object === Object
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
// window环境全局变量就是 self, 且 self.Object === Object
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

// 这里就判断了运行环境是 node 还是 window
var root = freeGlobal || freeSelf || Function('return this')()
```

### 暴露全局变量

定义全局变量 `_`

```javascript
// 检测node环境
/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

// Export lodash.
var _ = runInContext();

// 让后将 _ 挂载到全局环境上

// Some AMD build optimizers, like r.js, check for condition patterns like:
// AMD 环境
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lodash on the global object to prevent errors when Lodash is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    // Use `_.noConflict` to remove Lodash from the global object.
    root._ = _;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
        return _;
    });
}
// Check for `exports` after `define` in case a build optimizer adds it.
else if (freeModule) {
    //CommonJs nodejs环境下 导出一个模块
    // Export for Node.js.
    (freeModule.exports = _)._ = _;
    // Export for CommonJS support.
    freeExports._ = _;
} else {
    // window环境下
    // Export to the global object.
    root._ = _;
}
```

node 环境下， 存在 `exports` 和 `module` 这2个全局对象

```javascript
exports.xxx = function() {

}

module.exports = {
    xxx: function() {}
}

// 所以
typeof exports === 'object'
typeof module === 'object'
```

### runInContext 函数

```javascript
 var runInContext = (function runInContext(context) {

     context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));

     ....一些内置方法的引用

     function lodash(value) {
         if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
             if (value instanceof LodashWrapper) {
                 return value;
             }
             if (hasOwnProperty.call(value, '__wrapped__')) {
                 return wrapperClone(value);
             }
         }
         return new LodashWrapper(value);
     }

     function LodashWrapper(value, chainAll) {
         this.__wrapped__ = value;
         this.__actions__ = [];
         this.__chain__ = !!chainAll;
         this.__index__ = 0;
         this.__values__ = undefined;
     }

     return lodash
 })
```

从上面看， lodash 本质是返回了一个 `LodashWrapper` 包装对象

我们看看 `LodashWrapper` 做了哪些事情

### LodashWrapper

```javascript
function LodashWrapper(value, chainAll) {
    // 这样写，一定是一个  构造函数，而不是普通函数可以直接调用，需要new
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__chain__ = !!chainAll;
    this.__index__ = 0;
    this.__values__ = undefined;
}

// 继承
// 这里继承了 baseCreate 方法，这个方法是用来创建一个继承自 baseLodash.prototype 的对象
LodashWrapper.prototype = baseCreate(baseLodash.prototype);
// 这里重新指定了构造函数，指向自己
LodashWrapper.prototype.constructor = LodashWrapper;
```

```javascript
// 立即执行匿名函数
// 返回一个函数，用于设置原型 可以理解为是 __proto__

var baseCreate = (function() {
    // 这句放在函数外，是为了不用每次调用baseCreate都重复申明 object
    function object() {}

    return function(proto) {
        // 如果传入的参数不是object也不是function 是null
        // 则返回空对象。
        if (!isObject(proto)) {
            return {};
        }

        // 这里的objectCreate 就是 Object.create 方法
        if (objectCreate) {
            // 直接使用 Object.create(对象的原型)
            return objectCreate(proto);
        }

        // 在IE里面是不支持Object.create方法的
        // https://caniuse.com/?search=Object.create

        // 所以，采用下面的 ployfill实现
        object.prototype = proto;
        var result = new object;

        // 这里是为了重置 object的原型，避免污染， 因为上面 object 在这块本质是一个 闭包， 多次调用baseCreate ， 会导致原型被污染
        object.prototype = undefined;
        return result;
    };
}());
// 这里立即执行了
```

原型继承 - 基础示例

```javascript
function Animal() {
    this.name = '张飒'
}

Animal.prototype.say = function() {
    console.log(`${this.name}`);
}

function Dog() {
    Animal.call(this)
    this.age = 12
}

Dog.prototype = Object.create(Animal.prototype)

Dog.prototype.constructor = Dog

let d = new Dog()

d.say()
```

#### Object.create 替代实现

```javascript
function create(proto) {
    function object() {}

    object.prototype = proto

    var result = new object
    object.prototype = undefined
    return result
}
```

### baseLodash

```javascript
function baseLodash() {
    // No operation performed.
}
```

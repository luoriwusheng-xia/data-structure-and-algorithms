Function.prototype.myBind = function(context, ...args) {
  // 保存当前调用myBind 的函数，因为this指向调用 myBind的函数
  const fn = this

  // 如果context为null或者undefined，则设置为全局对象
  if (context === null || context === undefined) {
    if (typeof context !== 'undefined') {
      context = window
    } else {
      context = globalThis
    }
  }

  // 定义 返回的新函数
   function boundFunction(...newArgs) {
    // 判断是否作为构造函数使用， 通过 new.target 判断，属于ES6新增语法， 之前是通过 instanceof 判断
    if (new.target) {
      return new fn(...args, ...newArgs)
    } else {
      //  作为普通函数使用， this指向 context
      return fn.call(context, ...args, ...newArgs)
    }
  }


  // 继承原函数的原型
  if (fn.prototype) {
    boundFunction.prototype = Object.create(fn.prototype)
  } else {
    // 对于没有 prototype 的函数，创建一个空的 prototype
    /**
     * 示例：
     * function say() {}
      console.log(say.prototype)  // 这里返回的就是空对象 {}
     */
    boundFunction.prototype = {}
  }

  return boundFunction
}

// 测试代码

function sayHello(greeting) {
  return `${greeting}, my name is ${this.name} and I am ${this.age} years old.`;
}

const obj = { name: '李四', age: 25 };
const boundSayHello = sayHello.myBind(obj, 'Hello');
console.log(boundSayHello());


// 测试 构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;

  console.log('构造函数传入的参数', arguments);

}
Person.prototype.say = function(args) {
  console.log('构造函数上的参数', args);

  console.log(`${this.name} ${this.age}`);
}

let f2 = Person.myBind(obj, '初始化参数', 22)

let p1 = new f2('实例后的', 50)

p1.say('哈哈哈')

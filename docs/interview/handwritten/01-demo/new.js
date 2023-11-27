
function Person (age) {
  this.age = age

  // 如果返回一个对象 则下面p1 = {t: 1}
  // return {
  //   t: 1
  // }

  // 如果new Person 返回一个函数，则p1 = goods 就是一个函数
  return function goods () {
    return '1'
  }

  // 如果return  一个基本类型， 则p1 为全新的Person对象
}

Person.prototype.say = function () {
  return this.age
}

let p1 = new Person(12)
// console.log(p1)

// 测试3种场景
// 1、 构造函数返回一个函数
function Animal(age) {
  this.age = age

  return function hiFn() {
    return 'hi 函数'
  }
}

let p2 = myNew(Animal, 88)
console.log(p2)

// 场景2 - 构造函数返回一个对象
function Dog(age) {
  this.age = age

  return {
    t: 1
  }
}

let p3 = myNew(Dog, 77)
console.log(p3)

// 场景3就是构造函数什么也不返回 则实例对象p 为全新的对象
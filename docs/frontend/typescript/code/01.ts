class Test {
  constructor(public name) { // 这里其实是下面的简化写法。在构造函数上还是隐士初始化了一个 name属性

  }
}

let c = new Test('cc')
console.log(c.name);

// 跟下面的写法

class Test2 {
  public name
  constructor(name) { // 这里没有写类型，则name 是 any类型
    this.name = name
  }
}


let t2 = new Test2('写法2')
console.log(t2.name);

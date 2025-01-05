function Person(name) {
  if (new.target) {
      this.name = name;
      console.log(`${name} was instantiated using new.`);
  } else {
      throw new Error('请使用new 关键字去调用 函数');
  }
}

// 使用 new 关键字调用 Person 函数
const person1 = new Person('Alice');
// 输出: Alice was instantiated using new.

// 不使用 new 关键字调用 Person 函数
try {
  const person2 = Person('Bob');
} catch (e) {
  console.error(e.message);
  // 输出: 请使用new 关键字去调用 函数
}
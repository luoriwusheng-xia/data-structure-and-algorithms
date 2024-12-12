// 1. 创建一个副作用的收集桶
const bucket = new Set();

let activeEffect;

function effect(fn) {
  // 当调用 effect 注册副作用函数时， 将副作用函数fn赋值给activeEffect
  activeEffect = fn;

  // 执行副作用-这一步是实现任意副作用函数-避免硬编码写死
  fn();
}

const data = {
  text: '文档',
};

// 2. 创建一个代理对象
const obj = new Proxy(data, {
  get(target, key) {
    // 收集副作用 - 在set的时候，去触发副作用
    if (activeEffect) {
      // 这里现在添加的是 一个动态的副作用函数，而不是硬编码的 effect
      bucket.add(activeEffect);
    }

    return target[key];
  },

  set(target, key, newValue) {
    target[key] = newValue;

    // 触发副作用
    bucket.forEach((fn) => fn());

    // 返回true，表示设置成功
    return true;
  },
});

effect(() => {
  console.log('1');

  console.log('读取一次', obj.text);
});

setTimeout(() => {
  // 给obj添加一个不存在的属性
  obj.notExist = '不存在的属性';

  // 然而这里设置一个新属性的时候，又会触发上面的  匿名函数，这是不正确的 - 这是因为-副作用函数没有和目标字段建立关联。这里的问题就出现在 代理对象的 get中，还有收集副作用的桶需要重新设计
}, 1000);

// 1. 创建一个副作用的收集桶
const bucket = new WeakMap();

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
    // 没有 activeEffect，直接 return
    if (!activeEffect) return target[key];

    let depsMap = bucket.get(target);

    if (!depsMap) {
      // 不存在depsMap, 新建一个 map 与 target 进行管理， 这里做的意义就是一个树形结构，保证每个 属性都有自己的副作用函数，而不至于在set的时候触发了不相关的副作用函数
      depsMap = new Map();

      bucket.set(target, depsMap);
    }

    // 再根据 key 从 depsMap 中取得对应的 deps ,它是一个 Set类型
    // 这一步是从对应 属性中拿到对应的副作用函数
    let deps = depsMap.get(key);

    // 如果没有，说明是第一次，就新建一个 Set
    if (!deps) {
      deps = new Set();

      depsMap.set(key, deps);
    }

    // 最后将 当前激活的 副作用函数放进对应的 deps中
    deps.add(activeEffect);

    return target[key];
  },

  set(target, key, newValue) {
    target[key] = newValue;

    // 根据target 从同种取得 对应的 depsMap ， 它是一个 key --> effects 的映射关系
    const depsMap = bucket.get(target);

    if (!depsMap) return;

    // 再根据key拿出所有的这个key相关的 副作用函数
    const effects = depsMap.get(key);

    // 执行副作用函数
    effects && effects.forEach((fn) => fn());

    // 触发副作用
    // bucket.forEach((fn) => fn());

    // 返回true，表示设置成功
    return true;
  },
});

effect(() => {
  console.log('1');

  console.log('读取一次', obj.text);
});

setTimeout(() => {
  // 给obj添加一个不存在的属性 - 这时候，就不会再次触发副作用了
  obj.notExist = '不存在的属性';
}, 1000);

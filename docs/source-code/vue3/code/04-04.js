let data = {
  text: 'test-1',
  ok: true,
};

const obj = new Proxy(data, {
  get(target, key) {
    // 将副作用函数 activeEffect 添加到 存储副作用函数的桶中 - 代码优化（独立出去）
    track(target, key);

    // 返回属性值
    return target[key];
  },

  set(target, key, newValue) {
    target[key] = newValue;

    // 把副作用函数从桶里面拿出来，执行一遍 - 触发器
    trigger(target, key);

    // 表示设置成功； 在 浏览器环境如果这里没有返回 true，不会报错， 在 node 20中是会抛出 TypeError: 'set' on proxy: trap returned falsish for property 'ok' 错误； 这是node里面的规范更严格。
    return true;
  },
});

// 上面已经抽离一个基础版本的代理对象的模子， 现在主要来实现 track 和 trigger

let bucket = new WeakMap();
let activeEffect;
function track(target, key) {
  // 没有 activeEffect，直接 return
  if (!activeEffect) return;

  let depsMap = bucket.get(target);

  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }

  // 获取 key 对应的依赖集合
  let deps = depsMap.get(key);

  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  deps.add(activeEffect);
}

// 在 set 拦截函数内调用 trigger 函数触发变化
function trigger(target, key) {
  const depsMap = bucket.get(target);

  if (!depsMap) return;

  const effects = depsMap.get(key);

  effects && effects.forEach((fn) => fn());
}

const effect = (fn) => {
  activeEffect = fn;
  fn();
  activeEffect = null;
};

let c = 0;

effect(() => {
  // 存在分支切换的问题
  c = obj.ok ? obj.text : '没变';

  console.log('执行了', c);
});

obj.ok = false;

// 上面在切换了分支以后， 副作用函数还是执行了， 我这里改变的其实是 obj.ok

// 上面已经将 ok设置未 false 无论 obj.text 如何变动，都不应该再执行副作用函数，但是目前去改 obj.text 会重新执行，需要解决这个问题

// 会再次触发副作用函数的执行， 其实 c 没变， 但是还是执行了副作用函数
obj.text = 'text-3';

/**
 * 这里是解决分支切换 导致的 副作用问题
 */

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

  // deps 就是一个与当前副作用函数存在关联的依赖集合；
  // 现在将其添加到 activeEffect.deps 中
  activeEffect.deps.push(deps);
}

// 在 set 拦截函数内调用 trigger 函数触发变化
function trigger(target, key) {
  const depsMap = bucket.get(target);

  if (!depsMap) return;

  const effects = depsMap.get(key);

  // effects && effects.forEach((fn) => fn()); 去掉 - 这里会导致 和 cleanup 中的无线循环问题

  const effectsToRun = new Set();

  effects &&
    effects.forEach((fn) => {
      // 避免  effect(() => obj.count ++ )  产生的无限循环问题， 因为这里既是读取，也是赋值操作
      if (fn !== activeEffect) {
        effectsToRun.add(fn);
      }
    });

  effectsToRun.forEach((fn) => fn());
}

// effect 栈 - 为了解决 嵌套的effect的问题
const effectStack = [];

// 重新设计副作用函数
function effect(fn) {
  const effectFn = () => {
    // 调用 cleanup 函数完成清除工作
    cleanup(effectFn);

    activeEffect = effectFn;

    // 将当前副作用函数添加到 effectStack 中
    effectStack.push(effectFn);

    fn();
    // 将嵌套的 副作用弹出
    effectStack.pop();
    // 始终指向最新的副作用函数 - 「在嵌套的 副作用场景」因为上面的 fn执行，内层副作用已经执行完了
    activeEffect = effectStack[effectStack.length - 1];
  };

  // 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = [];

  // 执行副作用函数
  effectFn();
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    // 拿到所有的依赖集合
    const deps = effectFn.deps[i];

    // 将effectFn 从依赖集合中移除
    deps.delete(effectFn);
  }

  // 清空依赖集合, 这里始终操作的是一个  引用对象
  effectFn.deps.length = 0;
}

// 以下为测试代码
// let c = 0;

// effect(() => {
//   // 存在分支切换的问题
//   c = obj.ok ? obj.text : '没变';

//   console.log('执行了', c);
// });

// obj.ok = false;

// obj.text = 'text-3';

let temp1, temp2;

effect(() => {
  console.log('1 外层');

  effect(() => {
    console.log('2 内层');

    temp2 = obj.ok;
  });

  temp1 = obj.text;
});

// obj.ok = '12';
obj.text = 'text-3';

// 1. 创建一个副作用的收集桶
const bucket = new Set();

// 假设这是一个副作用函数，目前执行固定的动作
const effect = () => {
  console.log(1);
};

const data = {
  text: '文档',
};

// 2. 创建一个代理对象
const obj = new Proxy(data, {
  get(target, key) {
    // 收集副作用 - 在set的时候，去触发副作用
    bucket.add(effect);

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
console.log(obj.text);

obj.text = '文档更新';

setTimeout(() => {
  // 已经可以自动的触发 effect 函数,实现简易版本的响应式
  obj.text = '更新文档-2';
}, 1000);

/**
 * 上面已经实现了简易的响应式，实现了依赖收集
 *
 * 目前副作用还是硬编码，函数名也是死的，不够灵活
 */

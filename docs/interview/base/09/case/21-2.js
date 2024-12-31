function mySetInterval(callback, delay) {
  let timerId;

  function repeat() {
    timerId = setTimeout(() => {
      callback(); // 执行回调
      repeat(); // 递归调用以模拟周期性执行
    }, delay);
  }

  repeat(); // 启动第一次调用

  return {
    clear: () => clearTimeout(timerId), // 提供清除定时器的方法
  };
}

// 测试
const interval = mySetInterval(() => {
  console.log('Hello, world!');
}, 1000);

// 5秒后清除
setTimeout(() => {
  interval.clear();
  console.log('Interval cleared.');
}, 5000);

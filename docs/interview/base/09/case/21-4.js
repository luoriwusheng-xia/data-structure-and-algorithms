function rafSetInterval(callback, delay) {
  let start = performance.now(); // 使用高精度时间戳
  let timerId;

  function tick(timestamp) {
    if (timestamp - start >= delay) {
      callback();
      start = timestamp; // 更新起点时间
    }
    timerId = requestAnimationFrame(tick);
  }

  timerId = requestAnimationFrame(tick);

  return {
    clear: () => cancelAnimationFrame(timerId),
  };
}

// 测试
const rafTimer = rafSetInterval(() => {
  console.log('执行一次', new Date().toLocaleTimeString());
}, 1000);

// 5 秒后停止
setTimeout(() => {
  rafTimer.clear();
  console.log('定时器已停止');
}, 5000);

/**
 * 实现解析
    1. requestAnimationFrame
    每次 requestAnimationFrame 的回调执行频率是约 16ms（60FPS），利用该机制手动控制间隔时间。
    优点：依赖浏览器的渲染循环，适合与动画结合使用。
    缺点：当页面处于非活跃状态时，requestAnimationFrame 会暂停。
 */

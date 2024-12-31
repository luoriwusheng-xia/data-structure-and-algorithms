import fs from 'fs';

function preciseSetInterval(callback, delay) {
  let timerId;

  // 记录第一次的预期时间
  let startTime = Date.now() + delay;

  function repeat() {
    const now = Date.now();
    const diff = now - startTime; // 计算实际时间与预期时间的偏差

    // 这里如果是耗时的函数，则会导致 延迟时间增加
    callback();

    // 计算下一次的预期时间，并调整延迟
    startTime = startTime + delay;

    const nextDelay = Math.max(0, delay - diff);

    console.log('下一次', nextDelay);

    timerId = setTimeout(repeat, nextDelay);
  }

  // 第一次启动定时器
  timerId = setTimeout(repeat, delay);

  return {
    clear: () => clearTimeout(timerId),
  };
}

// 测试
const timer = preciseSetInterval(async () => {
  console.log('执行一次', new Date().toLocaleTimeString());

  for (let i = 0; i < 100000; i++) {
    // 模拟耗时操作

    // 如果文件存在，则追加
    if (fs.existsSync('./log.txt')) {
      fs.appendFileSync('./log.txt', String(i) + '\n', 'utf-8');
    } else {
      fs.writeFileSync('./log.txt', String(i), 'utf-8');
    }
  }
}, 1000);

// 5 秒后停止
setTimeout(() => {
  timer.clear();
  console.log('定时器已停止');
}, 5000);

/**
 * 实现解析
    1. 时间偏差 (drift) 计算
      每次执行时通过 Date.now() 计算当前时间与预期执行时间的偏差。
      根据偏差动态调整下一次的延迟时间，确保整个定时循环的总时间尽量接近预设值。

    2. 动态调整延迟
      使用 Math.max(0, delay - drift)，避免延迟时间小于零导致错误。

    3. 优点
      即使回调函数执行时间较长，也可以保持整体的间隔尽量稳定。
      减少累计误差。

    4. 不足
      如果单次回调函数执行时间超出 delay（例如：callback 执行耗时 2 秒，而 delay 是 1 秒），无法完全解决问题，间隔仍会受影响。
 *
 */

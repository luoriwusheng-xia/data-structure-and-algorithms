function workerSetInterval(callback, delay) {
  const blob = new Blob([
    `
    self.onmessage = function(e) {
      const delay = e.data;
      function tick() {
        setTimeout(() => {
          self.postMessage(null);
          tick();
        }, delay);
      }
      tick();
    };
  `,
  ]);

  const worker = new Worker(URL.createObjectURL(blob));
  worker.postMessage(delay);

  worker.onmessage = () => {
    callback();
  };

  return {
    clear: () => worker.terminate(),
  };
}

// 测试
const workerTimer = workerSetInterval(() => {
  console.log('执行一次', new Date().toLocaleTimeString());
}, 1000);

// 5 秒后停止
setTimeout(() => {
  workerTimer.clear();
  console.log('定时器已停止');
}, 5000);

/**
 * Web Worker
    Web Worker 在后台线程运行，不受主线程阻塞的影响。
    使用 setTimeout 在 Worker 内创建循环计时机制，并通过 postMessage 将信号发送到主线程。
    优点：高精度，不受主线程阻塞。
    缺点：需要额外创建 Worker，会增加资源消耗。
 */

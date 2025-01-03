/**
 * 并发任务数组 完成最大并发数后才会继续
 * @param tasks 任务数组
 * @param maxCount 最大并发数，默认 4
 */
function concurrentTask (tasks = [], maxCount = 4) {
  let len = tasks.length;
  let finalCount = 0;
  let nextIndex = 0;

  // 所有异步任务的结果，都是按照顺序存储的； resArr里面不仅有成功的结果，也可能有失败的结果
  let resArr = [];

  return new Promise((resolve) => {
    if (len === 0) return resolve([]);

    // 一次性运行最大并发任务
    for (let i = 0; i < maxCount && i < len; i++) {
      _run();
    }

    /** 完成一个任务时，递归执行下一个任务。直到所有任务完成 */
    function _run () {
      const taskIndex = nextIndex++
      const task = tasks[taskIndex];

      Promise.resolve(task())
        .then((res) => {
          resArr[taskIndex] = { status: 'fulfilled', value: res };
          // resArr[taskIndex] = res
        })
        .catch((err) => {
          // 如果希望知道异常 ，可以这样扩展结果
          resArr[taskIndex] = { status: 'rejected', reason: err };
          // resArr[taskIndex] = err
        })
        .finally(() => {
          // 这里需要判断是否还有下一个任务，如果有则继续执行，如果没有则结束。
          if (nextIndex < len) {
            _run()
          }

          // 判断是否是所有任务完成
          if (++finalCount === len) {
            resolve(resArr);
          }
        });
    }
  });
}

// 以下代码均为测试代码
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// console.log(1, new Date())
// await sleep( 3000)
// console.log(2, new Date());

let fn1 = async () => {
  await sleep(2000);
  console.log('第一个请求');

  return {
    code: 0,
    data: 100,
  };
};

let fn2 = async () => {
  await sleep(2000);
  console.log('第2个请求');

  return {
    code: 0,
    data: 300,
  };
};
let fn3 = async () => {
  await sleep(100);
  console.log('第3个请求');

  return {
    code: 0,
    data: 333,
  };
};

let fn4 = async () => {
  await sleep(200);
  console.log('第4个请求');

  return {
    code: 0,
    data: 444,
  }
};

concurrentTask([fn1, fn2, fn3, fn4], 2).then((res) => {
  console.log(res);
});

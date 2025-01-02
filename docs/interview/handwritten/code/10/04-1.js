function asyncSerial(tasks) {
  // 使用 reduce 方法来依次执行任务。
  return tasks.reduce((promiseChain, currentTask) => {
    // 在 reduce 方法的 then 回调中，执行当前任务，并将结果添加到 chainResults 数组中，然后返回更新后的 chainResults 数组。
      return promiseChain.then((chainResults) => {
          return currentTask().then((currentResult) => {
              chainResults.push(currentResult);
              return chainResults;
          });
      });
  }, Promise.resolve([])); // 初始的 Promise 是 Promise.resolve([])，表示一个已解决的空数组 Promise。
}


// 示例用法
const tasks = [
  () => new Promise((resolve) => setTimeout(() => resolve(1), 1000)),
  () => new Promise((resolve) => setTimeout(() => resolve(2), 500)),
  () => new Promise((resolve) => setTimeout(() => resolve(3), 200))
];

asyncSerial(tasks).then((results) => {
  console.log(results);
}).catch((error) => {
  console.error(error);
});
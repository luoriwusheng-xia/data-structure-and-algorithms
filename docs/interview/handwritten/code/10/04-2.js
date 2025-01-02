function asyncParallel(tasks) {
  return Promise.all(tasks.map(task => task()));
}

// 示例用法
const tasks = [
  () => new Promise((resolve) => setTimeout(() => resolve(1), 1000)),
  () => new Promise((resolve) => setTimeout(() => resolve(2), 500)),
  () => new Promise((resolve) => setTimeout(() => resolve(3), 200))
];

asyncParallel(tasks).then((results) => {
  console.log(results);
}).catch((error) => {
  console.error(error);
});
function processIdleTasks(deadline) {
  while (
    (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
    tasks.length > 0
  ) {
    // 执行低优先级任务
    const task = tasks.shift();
    task();
  }

  if (tasks.length > 0) {
    // 如果还有任务未完成，继续请求下一次 idle callback
    requestIdleCallback(processIdleTasks);
  }
}

// 低优先级任务列表
const tasks = [];

// 添加低优先级任务
function addTask(task) {
  tasks.push(task);

  // 如果当前没有请求进行中，则请求下一次 idle callback
  if (tasks.length === 1) {
    requestIdleCallback(processIdleTasks);
  }
}

// 添加低优先级任务
addTask(function () {
  console.log('Task 1');
});

addTask(function () {
  console.log('Task 2');
});

addTask(function () {
  console.log('Task 3');
});

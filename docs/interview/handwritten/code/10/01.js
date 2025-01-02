// 使用 promise来实现 sleep
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

sleep(1000).then(() => {
  // 这里写你的骚操作
})
function debounce(fn, delay, immediate = false) {
  let timer = null

  let callNow = immediate

  return function (...args) {
    if (callNow) {
      console.log('立即调用')
      fn.apply(this, args)

      callNow = false
    }

    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

let f1 = debounce(function() {
  console.log(1, new Date(), '参数', arguments)
}, 1000, true)

console.log('开始前：',new Date());

// 会执行
// setInterval(f1.bind(null ,34, 51), 1100)

// 只执行一次， 后续函数不会输出，因为 500 毫秒小于 1s, 导致 timer 一直被清空重新创建
setInterval(f1.bind(null ,34, 51), 500)
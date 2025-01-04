/**
 * 节流函数-支持立刻调用
 * @param {*} fn
 * @param {*} delay
 * @param {*} immediate
 * @returns
 */
function throttle (fn, delay, immediate = false) {
  let timer = null

  let callNow = immediate

  return function (...args) {
    if (callNow) {
      console.log('立刻调用');

      fn.apply(this, args)
      callNow = false
    }

    if (!timer) {
      const context = this

      timer = setTimeout(() => {
        fn.apply(context, args)

        timer = null
      }, delay)

    }
  }
}

// 测试代码

// '这里输出的时间跟第一次立刻调用应该差不多'
console.log(new Date());

let f1 = throttle(() => console.log(1, new Date()), 1000, true)

setInterval(f1, 500)
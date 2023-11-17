 function getUser () {
  return fetch('./1.json')
}

 function m1 () {
  return getUser()
}

 function main () {
  // 这里会运行2次
  console.log('运行');
  let reuslt = m1()

  console.log('main--->', reuslt);
}

/**
 * run函数需要将传入的函数执行2次
 *
 * 1、第一次执行，需要让函数报错
 * 2、第二次执行，函数会拿到真正的结果
 */
function run (func) {
  // 结果
  let cache = {
    status: 'pending',
    value: null
  }

  let oldFetch = globalThis.fetch

  globalThis.fetch = function (...args) {
    // 有缓存了-
    //  请求成功
    if (cache.status === 'sucess') {
      return cache.value
    }

    // 请求失败-失败了也有结果，也需要将结果返回
    if (cache.status === 'fail') {
      throw cache.value
    }

    // 发送真实的请求
    const prom = oldFetch(args).then(res => res.json()).then((res) => {
      cache.status = 'sucess'
      cache.value = res
    }).catch(err => {
      cache.status = 'fail'
      cache.value = err
    })

    // 这里一定要抛出一个错误
    throw prom
  }


  try {
    // 执行函数 - 第一次，一定会报错-也是期望它报错
    func()
  } catch (error) {
    // 如果报错是一个Promise实例， 则说明 上面的 fetch 的状态变化了，此时，重新执行，拿到结果
    if (error instanceof Promise) {
      // 不管成功还是失败，都需要调用func函数，这也就是第二次调用func函数。

      error.then(() => func(), () => func()).finally(() => {
        // 最后恢复原始fetch
        globalThis.fetch = oldFetch
      })
    }
  }

}

run(main)

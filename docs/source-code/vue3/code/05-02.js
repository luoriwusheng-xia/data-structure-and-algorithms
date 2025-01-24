class ReactiveEffect {

  _isRunning = 0

  // vue3源码使用的 flags
  flags = 1 || 4


  // vue@3.5.13版本中 packages/reactivity/src/effect.ts
  run() {

    // b站
    this._isRunning++

    try {
      // ....
      return this.fn()
    } catch (error) {

      this._isRunning--
    }
  }
}

// 这里跟vue3源码有点出入。
export function triggerEffect(dep) {
  //  dep 是一个 Map结构， 所有这里的 for...of 遍历的是 map
  // dep.keys() 遍历的是 keys

  for (let effect of dep.keys()) {

    // 如果上面的 fn函数正在执行，就不要执行，避免死循环
    /**
     * effect(() => {
     *     // 读取
     *    conosle.log( p1.age)
     *   这里修改，会重新触发effect 的回调函数，所以会出现死循环
     *    p1.age =  Math.Random()
     * })
     *
     */
    console.log('effect._isRunning', effect._isRunning);


    if (!effect._isRunning) {
      // effect.scheduler 就是 effect(() => {} ) 用户传入的回调函数，也就是上面的 class ReactiveEffect 中的 scheduler
      if (effect.scheduler) {
        // 属性发生变化，本意就是要重新执行 effect传入的副作用函数的， 这里执行一下，就实现了 属性变化，自动响应
        effect.scheduler()
      }
    }
  }
}
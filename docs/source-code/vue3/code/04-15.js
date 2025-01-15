// 用于记录代理后的结果， 避免重复代理
const existingProxy = new WeakMap()

export function reactive(target) {
  return createReactiveObject(target)
}


function createReactiveObject(target) {
  ....

  const existingProxy = proxyMap.get(target)

  if (existingProxy) {
    return existingProxy
  }

  ... 响应式其他代码
}

// 测试代码： 示例： 避免对同一个对象多次代理

import {reative} from 'vue'

let obj = {
  name: '张三',
  age: 12
}

let p1 = reactive(obj)
let p2 = reactive(obj)
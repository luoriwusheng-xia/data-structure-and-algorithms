// 代码示例：

import { reactive } from 'vue'

let obj5 = reactive({
  name: 'xxx',
  address: {
    code: 12
  }
})

effect(() => {
  el.innerHTML = obj5.name + obj5.address.code
})

setTimeout(() => {
  obj5.address.code = 10000
}, 1000);



// 底层就是，创建的 代理对象，如果在 get中，拿到的是对象，则重新返回一个新的 代理对象
// vue@3.5.13 中 packages/reactivity/src/baseHandlers.ts

export function reactive (target) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap,
  )
}

export const mutableHandlers = new MutableReactiveHandler()

class MutableReactiveHandler extends BaseReactiveHandler {
  // ...
}

class BaseReactiveHandler {
  get () {

    // ...

    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      isRef(target) ? target : receiver,
    )


    // 如果是对象

    if (isObject(res)) {
      // 递归代理
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
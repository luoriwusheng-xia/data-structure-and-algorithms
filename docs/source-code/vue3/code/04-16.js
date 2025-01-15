
enum ReactiveFlags {
  IS_REACTIVE = '___v_isReactive'
}

export function reactive (target) {
  return createReactiveObject(target)
}

const mutableHandlers: ProxyHandler<any> = {
  get (target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true

  },

  set (target, key, value, receiver) {

    return Reflect.set(target, key, value, receiver)
  }
}

function createReactiveObject (target) {
  // 如果已经是一个代理对象，则直接返回

  /**
   let obj = {
      name: true,
      age: 12
    }

    let c = reactive(obj)

    // 避免这种情况
    let c3 = reactive(c)
    console.log(c === c3);
   */
  // 读取特定属性，如果读取到了，则说明已经是一个代理对象，直接返回即可； 这里会调用上面  get ，因为是一个读取的动作
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // 如果已经代理过了，直接返回。避免对同一个对象重复代理
  /**
    let obj = {
      name: true,
      age: 12
    }

    let c = reactive(obj)

    let c2 = reactive(obj)

    console.log(c);
    console.log(c2);
    console.log(c === c2);
   */

  let exit = reactiveMap.get(target)

  if (exit) {
    return exit
  }

  let proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy)

  return proxy
}
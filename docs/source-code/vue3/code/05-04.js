export function ref(value) {
  return createRef(value)
}

function createRef(value) {
  // 其他： 判断传入的值是基础类型还是对象， 对象就使用 reactive 创建代理对象即可， 普通类型，则直接返回

  // 这里就返回了一个实例
  return new RefImpl(value)
}

class RefImpl {
  _value

   // 在 p1.value 的时候，就触发了 读的操作,读的操作会做依赖收集
  get value() {
    // ... 其他   依赖收集

    return this._value
  }

  // 在 p1.value = 222， 写操作的时候，就触发相关依赖的更新
  set value(newValue) {
    // 值发生了变化
    if (newValue !== this._value) {
      this._value = newValue
    }

    // ... 其他： 触发更新
  }

}
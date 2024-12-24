let str = 'vue';

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      console.log('触发响应');

      return Reflect.set(target, key, value, receiver);
    },
  });
}

// const wrapper = {
//   value: 'vue',
// };

// const d = reactive(wrapper);

// d.value = 12;

function ref(val) {
  const wrapper = {
    value: val,
  };
  // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  });

  return reactive(wrapper);
}

// 现在创建一个原始值的响应式对象
const foo = ref(1);

console.log(foo.value);

foo.value = 2;
console.log(foo);
console.log('自定义属性： ', foo.__v_isRef);

// 上面已经实现了对基础类型的响应

function toRefs() {}

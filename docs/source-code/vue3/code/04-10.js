/**
 * 包装对象，返回一个代理对象
 * @param {*} target
 * @param {*} isShallow 浅只读
 * @param {*} isReadonly 只读
 * @returns
 */
function reactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 深层对象是要代理一下的，否则无法进行拦截操作

      const res = Reflect.get(target, key, receiver);
      // 浅只读，则直接返回
      if (isShallow) {
        return res;
      }

      // 深层对象
      if (typeof res === 'object') {
        return reactive(res, isShallow, isReadonly);
      }
    },
    set(target, key, newValeu, receiver) {
      const res = Reflect.get(target, key, receiver);

      if (isReadonly) {
        console.log(`只读，${key}不能修改`);

        if (typeof res === 'object') {
          return reactive(res, isShallow, isReadonly);
        }

        return true;
      }

      // 浅只读
      if (isShallow) {
        console.log(`浅只读, ${key} 不可修改`);
        return res;
      }

      return Reflect.set(...arguments);
    },

    deleteProperty(target, key) {
      if (isReadonly) {
        console.log(`只读，${key}不能删除`);

        return true;
      }

      // 浅只读-删除逻辑
      if (isShallow) {
        const propertyValue = target[key];

        if (typeof propertyValue === 'object') {
          // 如果属性值是对象，说明是深层对象，允许删除（因为浅只读只限制第一层）
          return Reflect.deleteProperty(target, key);
        }

        console.log(`${key} 不能被删除（浅只读限制）`);
        return true;
      }

      // 直接删除
      return Reflect.deleteProperty(...arguments);
    },
  });
}

/**
 * 浅层只读，深层对象仍旧可以修改
 */
function readonly(target) {
  return reactive(target, false, true);
}

function shallowReadonly(target) {
  return reactive(target, true, false);
}

// 测试代码 - 深只读
const testDeepReadOnly = () => {
  const testObj = readonly({
    foo: 1,

    deepObj: {
      c: 1,
    },
  });

  console.log(testObj.foo);

  // 成功拦截到
  testObj.foo = 2;
  delete testObj.foo;

  // 深层对象-不可修改
  testObj.deepObj.c = 2;
  // 深层对象-不可删除
  delete testObj.deepObj.c;

  console.log(testObj); // { foo: 1, deepObj: {} }
};

testDeepReadOnly();
// 实现浅只读

const testShallowReadOnly = () => {
  const testObj = shallowReadonly({
    foo: 1,

    deepObj: {
      c: 1,
    },
  });

  // console.log(testObj.foo);

  // 成功拦截到 - 还是1
  testObj.foo = 2;

  // 都拦截到了
  delete testObj.foo;

  // 能够删除成功
  delete testObj.deepObj.c;

  delete testObj.deepObj;
  console.log(testObj);
};

testShallowReadOnly();

function mitt() {
  let all = new Map();

  // 使用 Map 存储尚未被订阅的事件。
  const eventCache = new Map();

  return {
    all,

    on(type, fn) {
      let handlers = all.get(type);

      if (handlers) {
        handlers.push(fn);
      } else {
        all.set(type, [fn]);
      }

      // 如果缓存中有事件，立刻触发
      if (eventCache.has(type)) {
        const cachedEvent = eventCache.get(type);

        // 立即执行这个函数
        fn(cachedEvent);

        // 删除缓存
        eventCache.delete(type);
      }
    },

    off(type, fn) {
      let handlers = all.get(type);

      if (handlers) {
        if (fn) {
          // 只删除这个fn
          // handlers.indexOf(fn) >>> 0  跟  handlers.indexOf(fn) !== -1 是一样的意思
          handlers.splice(handlers.indexOf(fn) >>> 0, 1);
        } else {
          all.set(type, []);
        }
      }
    },

    emit(type, ...args) {
      let handlers = all.get(type);

      // 新增异步场景
      let promisesList = [];

      if (handlers) {
        handlers.slice().map((fn) => {
          let result = fn(...args);

          // 处理异步逻辑
          if (result && result instanceof Promise) {
            promisesList.push(result);
          }
        });
      } else {
        eventCache.set(type, ...args);
      }

      // 通配符实现的比较简单，直接将* 对应的 [fn, fn, fn] 全部执行一遍即可
      handlers = all.get('*');

      if (handlers) {
        handlers.slice().map((fn) => {
          let result = fn(type, ...args);

          // 处理异步逻辑
          if (result && result instanceof Promise) {
            promisesList.push(result);
          }
        });
      }

      return Promise.all(promisesList).then(() => {});
    },

    /**
     * mitt 源码是没有once的， 大概率是不想有 this，本身在doc文档中也是说无this
     * @param {*} type
     * @param {*} fn
     */
    once(type, fn) {
      const innerFn = (...args) => {
        fn(...args);
        this.off(type, innerFn);
      };

      this.on(type, innerFn);
    },

    clean() {},
  };
}

const emitter = mitt();

// listen to an event
emitter.on('foo', (e) => console.log('foo', e));

// listen to all events
// emitter.on('*', (type, e) => console.log(type, e));

// fire an event

// 测试 once
// emitter.once('once', (...args) => console.log('once', ...args));
// emitter.emit('once', 1, 2, 3);
// emitter.emit('once');

// // 因为本身 all 是一个 Map结构，所以，可以直接调用 Map中的 clean 实现全部清空的效果
// console.log(emitter.all);

// emitter.all.clear();

// // 清空后再次调用，无效
// emitter.emit('foo', { a: 'b' });

// 测试先 触发，后订阅的事件
// emitter.emit('after', '后触发的');

// emitter.on('after', async (arg) => {
//   await new Promise((resolve) => setTimeout(resolve, 100));
//   console.log('拿到的参数', arg);
// });

emitter.on('myEvent', async (event) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log('异步事件:', event);
});

emitter.on('myEvent', (data) => {
  console.log('同步的', data);
});

emitter.emit('myEvent', { data: 'Hello, world!' }).then(() => {
  console.log('所有异步事件处理完成');
});

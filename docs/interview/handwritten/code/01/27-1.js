class LRUCache {
  constructor(length) {
    this.length = length; // 存储长度
    this.data = new Map(); // 存储数据
  }
  // 存储数据，通过键值对的方式
  set(key, value) {
    const data = this.data;

    // 有的话 删除 重建放到map最前面
    if (data.has(key)) {
      data.delete(key);
    }

    data.set(key, value);

    // 如果超出了容量，则需要删除最久的数据
    if (data.size > this.length) {
      // 删除map最老的数据
      const delKey = data.keys().next().value;
      data.delete(delKey);
    }
  }
  // 获取数据
  get(key) {
    const data = this.data;
    // 未找到
    if (!data.has(key)) {
      return null;
    }
    const value = data.get(key); // 获取元素
    data.delete(key); // 删除元素
    data.set(key, value); // 重新插入元素到map最前面

    return value; // 返回获取的值
  }
}
var lruCache = new LRUCache(5);

// 测试
// 存储数据

lruCache.set('name', 'test');
lruCache.set('age', 10);
lruCache.set('sex', '男');
lruCache.set('height', 180);
lruCache.set('weight', '120');
console.log(lruCache);

// 测试-2
let test = new Map()

test.set('name', '姓名')
test.set('age', 12)

// test.keys() 拿到的就是 所有 key的集合， 类型是一个 MapIterator

// 这里就是上面 为什么直接调用删除的原因，因为最先添加进去的，属于最先过期的 key
console.log('拿到最先添加进 Map结构中的key: ',test.keys().next().value); // name


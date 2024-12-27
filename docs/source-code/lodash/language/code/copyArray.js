/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
    length = source.length;

  // 这里 array 可以不传，不传递，其实就是 new Array(length) 初始化一个空数组
  array || (array = Array(length));
  while (++index < length) {
    // 就挨个复制一下
    array[index] = source[index];
  }
  return array;
}

// 也可以使用 如下方式拷贝数组和对象
// 代码参照 https://github.com/sodiray/radash/blob/master/src/object.ts
function copyArray2(source) {
  let arr = [];
  //  Object.getOwnPropertyNames(source) 拿到的就是对象身上除了 Symbol 和原型链上的属性
  // 数组的属性就是 所有的下标 + length,  例如 ['0', '1', '2', 'length']
  Object.getOwnPropertyNames(source).forEach((prop) => {
    arr[prop] = source[prop];
  });

  return arr;
}
let c = [1, 2, 3];

copyArray2(c);

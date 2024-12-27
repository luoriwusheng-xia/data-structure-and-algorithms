function initCloneArray(array) {
  var length = arr.length;
  // 本质就是  new Array(4)
  var result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  //  这块处理正则的场景
  // 例如： let array = /c/.exec('abcde'), 这时候， array 返回的是 [ 'c', index: 2, input: 'abcde', groups: undefined ]

  if (
    length &&
    typeof array[0] == 'string' &&
    hasOwnProperty.call(array, 'index')
  ) {
    // 所以。数组的第一个元素是字符串，且包含 index 属性
    result.index = array.index;
    result.input = array.input;
  }

  // 返回的是一个 空数组， 或者空的正则对象执行后的数组
  return result;
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  // 拿到构造器，然后拿到 正则的 flag
  // regexp.constructor 是 RegExp 构造函数，这里是利用了正则表达式对象的构造函数来创建一个新的正则表达式。
  // regexp.source 包含了正则表达式的模式部分，例如对于 /abc/，source 就是 'abc'。通过将原正则表达式的 source 作为新正则表达式的模式，保证了模式的复制。
  // lastIndex 是正则表达式的一个属性，它表示下一次匹配开始的位置。对于具有 g 标志的全局匹配的正则表达式，这个属性会在每次匹配后更新。将其复制到新的正则表达式对象中，确保新的正则表达式在使用时具有与原正则表达式相同的状态。
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

// 示例代码
const _ = require('lodash');

const originalRegex = /abc/gi;
originalRegex.lastIndex = 5;

const clonedRegex = _.cloneDeep(originalRegex);

console.log(originalRegex.source);
console.log(clonedRegex.source);
console.log(originalRegex.flags);
console.log(clonedRegex.flags);
console.log(originalRegex.lastIndex);
console.log(clonedRegex.lastIndex);

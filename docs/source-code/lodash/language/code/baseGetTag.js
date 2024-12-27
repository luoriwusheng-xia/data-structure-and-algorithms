/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  // symToStringTag 就是这个 Symbol.toStringTag， 取了一个变量名

  // 判断一下对象身上有没有 [Symbol.toStringTag] 这个属性， 如果有，则要删除掉，也就进入  getRowTag 逻辑， 因为这个属性改变的就是 toString的结果
  // 如果没有，则就是普通对象， 就拿到这个对象 toString的结果即可
  return symToStringTag && symToStringTag in Object(value)
    ? getRawTag(value)
    : objectToString(value);
}

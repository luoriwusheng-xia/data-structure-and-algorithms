/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  // 使用 hasOwnProperty 方法检查 value 是否自身拥有 symToStringTag 属性。symToStringTag 通常是 Symbol.toStringTag，用于自定义对象的 toString 行为。
  var isOwn = hasOwnProperty.call(value, symToStringTag),
    tag = value[symToStringTag];

  try {
    // 尝试将 value 的 symToStringTag 属性设置为 undefined，并设置 unmasked 为 true
    // 这里使用 try...catch 是因为有些对象可能不允许修改其 symToStringTag 属性，比如一些内置对象或者通过代理设置为不可写的对象。

    /**
     *  这里主要是用来屏蔽对象上有  Symbol.toStringTag 属性， 因为这个属性可以重写值，导致 toString 的结果不准确
     * let myObj = { [Symbol.toStringTag]: 'MyCustomObject' };
        console.log(myObj.toString());  // [object MyCustomObject]
     */
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  // nativeObjectToString 就是 Object.prototype.toString  , 这里拿到 value的 字符串结果
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

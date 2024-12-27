/**
 *
 * 判断是否为类数组, 真正的数组
 * 比如 DOMList， NodeList， arguments 等
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * 字符串也有length属性
 * _.isArrayLike('abc');
 * // => true
 *
 * 函数有length属性，但是不是类数组
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  // 不为空， 有length属性， 不是函数
  return value != null && isLength(value.length) && !isFunction(value);
}

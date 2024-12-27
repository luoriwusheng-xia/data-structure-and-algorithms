/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  // node 环境的
  /**
   * const c = new Buffer([1,2,3]) // 得到 <Buffer 01 02 03>
   * c.length // 3
   *
   * const result = new c.constructor(3) // 创建一个新的buffer , 长度为3 ， Buffer 00 00 00
   *
   * result.set(new Uint8Array([12,3,4])) // 将 12,3,4 赋值给 result， 此时 reuslt 值就是 <Buffer 0c 03 04>
   *
   * return result // 已经实现了 buffer的拷贝
   */

  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

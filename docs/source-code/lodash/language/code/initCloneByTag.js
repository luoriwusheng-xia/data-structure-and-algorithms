/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    // arrayBufferTag 其实就是  '[object ArrayBuffer]'
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    // 布尔类型和日期类型的，这里value本质是 Boolean(1), Date(xxx) 这种 包装后的对象
    case boolTag:
    case dateTag:
      // 直接调用构造函数，重新生成一个即可; 注意：这里使用+， 进行了类型转换
      // 如果是 Boolean(1)，+1 则变为 true,最终就是 new Boolean(true); Boolean(+"12121") --》 +"12121" 也是 true
      /**
       * 对于日期类型
       * let c = new Date()
       *
       * +c --》 1735205059509  就转换为从 1970 年 1 月 1 日以来的毫秒数， 时间戳
       * 这样做是为了确保深拷贝一个 Date 对象时，得到的是一个全新的 Date 对象，其日期和时间与原始 Date 对象相同，但不共享相同的引用。如果直接复制原始的 Date 对象，可能会出现引用问题，导致修改一个 Date 对象会影响另一个，而深拷贝的目的是创建完全独立的副本。
       *
       *
       * const _ = require('lodash');
        const originalBoolean = true;
        const originalDate = new Date();

        const deepClonedBoolean = _.cloneDeep(originalBoolean);
        const deepClonedDate = _.cloneDeep(originalDate);

        console.log(originalBoolean === deepClonedBoolean); // false
        console.log(originalDate === deepClonedDate); // false
       *
       */
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag:
    case float64Tag:
    case int8Tag:
    case int16Tag:
    case int32Tag:
    case uint8Tag:
    case uint8ClampedTag:
    case uint16Tag:
    case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      // Map 直接返回 new Map
      return new Ctor();

    case numberTag:
    case stringTag:
      // number 和 string类型，直接返回 new Number, new String
      return new Ctor(object);

    case regexpTag:
      // 正则的拷贝，几个关键点： new 正则的构造器，然后拿到原始对象的正则匹配模式 w,g,i等； 然后还有 正则的 lastIndex
      return cloneRegExp(object);

    case setTag:
      // Set的拷贝
      return new Ctor();

    case symbolTag:
      // Symbol 的拷贝；Symbol.prototype.valueOf.call(object)

      /**
       * const symbol = Symbol('uniqueKey');
       * 拿到新的Symbol 的 value
       * let symbolValueOf =  Symbol.prototype.valueOf.call(symbol)
          console.log(typeof symbolValueOf) // symbol
          console.log(symbolValueOf) // Symbol('uniqueKey')
      */

      /**
       * const _ = require('lodash');
        // 定义一个 Symbol
        const symbol = Symbol('uniqueKey');
        const originalObject = {
          [symbol]: 'value'
        };

        // 使用 Lodash 的 cloneDeep 进行深拷贝
        const clonedObject = _.cloneDeep(originalObject);

        console.log(originalObject[symbol]);
        console.log(clonedObject[symbol]);
       */
      return cloneSymbol(object);
  }
}

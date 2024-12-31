/**
 * 修改原型链的方式
 * @param {*} ctx
 * @returns
 */
Function.prototype.bind = function (ctx) {
  var fn = this;
  return function () {
    fn.apply(ctx, arguments);
  };
};

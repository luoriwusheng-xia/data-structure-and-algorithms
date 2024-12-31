function myBind(ctx, fn) {
  let args = Array.prototype.slice.call(arguments, 2);

  return function () {
    let arg2 = Array.from(arguments);

    return fn.apply(ctx, args.concat(arg2));
  };
}

let ob = {
  age: 12,
  say() {
    console.log(this.age);
    console.log('参数列表', arguments);
  },
};

let c = {
  age: 18,
};

// 原生用法
ob.say.bind(c, 12)(9999); // 参数列表 [Arguments] { '0': 12, '1': 9999 }

var f1 = myBind(c, ob.say, 88);

f1(99); // 参数列表 [Arguments] { '0': 88, '1': 99 }

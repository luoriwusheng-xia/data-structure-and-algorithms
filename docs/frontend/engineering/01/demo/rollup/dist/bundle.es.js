const sum$1 = (a, b) => a + b;

// 导出一个和sum.js重名的

let sum = 2;

const a = 1;

const c = sum$1(1, 2);

console.log(c);

console.log(sum);
var app = {
  say () {
    console.log(a);
  }
};

export { app as default };

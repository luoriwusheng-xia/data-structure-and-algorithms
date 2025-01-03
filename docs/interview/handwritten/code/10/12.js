function add (a, b) {
  //取两个数字的最大长度
  let maxLength = Math.max(a.length, b.length);

  //用0去补齐长度
  a = a.padStart(maxLength, 0);//"0009007199254740991"
  b = b.padStart(maxLength, 0);//"1234567899999999999"

  //定义加法过程中需要用到的变量
  let f = 0;   //"进位"
  let sum = "";

  for (let i = maxLength - 1; i >= 0; i--) {
    // 相加， 看是否满10， 就需要走下面的 进1
    let t = parseInt(a[i]) + parseInt(b[i]) + f;
    // 如果满10， 就进1
    f = Math.floor(t / 10);

    // 这里注意一定是 t/%10在前面，否则出现的结果是倒着的
    sum = t % 10 + sum;
  }

  //  看最高位是否需要进位
  if (f !== 0) {
    sum = '' + f + sum;
  }

  // 注意： 这里一定是字符串类型，因为数字类型会存在溢出的问题
  return sum;
}

// 测试
console.log(add('123', '10')) // 133
console.log(add('123', '10000')) // 10123
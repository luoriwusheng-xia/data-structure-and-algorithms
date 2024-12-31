function getByteLength(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }

  let byteLength = 0;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);

    if (charCode <= 0x7f) {
      // ASCII字符（0x00 ~ 0x7F）：1字节
      byteLength += 1;
    } else if (charCode <= 0x7ff) {
      // 双字节字符（0x80 ~ 0x7FF）：2字节
      byteLength += 2;
    } else if (charCode <= 0xffff) {
      // 三字节字符（0x800 ~ 0xFFFF）：3字节
      byteLength += 3;
    } else {
      // 四字节字符（超出BMP的字符，常用于表情符号等）
      byteLength += 4;
    }
  }

  return byteLength;
}

// 测试
console.log(getByteLength('Hello')); // 5
console.log(getByteLength('你好')); // 6 (3字节 × 2)
console.log(getByteLength('👋')); // 4
console.log(getByteLength('Hello 👋 你好')); // 15

/**
 * 解释
  1. ASCII字符： 字符码在 0x00 到 0x7F 之间，每个字符占 1 字节。
  2. 多字节字符：
        UTF-8 编码中，字符根据其 Unicode 编码值会占用 1 到 4 字节。
        例如：
        A：ASCII字符，占 1 字节。
        中：Unicode编码为 0x4E2D，占 3 字节。
        表情符号（如 👋）：超出BMP（基本多语言面）的字符，占 4 字节。
 */

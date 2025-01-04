const isValid = function (s) {
  // 成对，则一定是偶数， 如果为奇数，则返回 false
  if (s.length % 2 === 1) {
    return false;
  }

  // 创建一个字典
  const regObj = {
    "{": "}",
    "(": ")",
    "[": "]",
  };

  // 初始化一个空栈 stack 来存储左括号
  let stack = [];

  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{" || s[i] === "(" || s[i] === "[") {
      // 入栈
      stack.push(s[i]);
    } else {
      // 出栈
      const cur = stack.pop();

      // 如果发现不匹配，则直接返回 false
      if (s[i] !== regObj[cur]) {
        return false;
      }
    }
  }

  // 上面循环会经历入栈， 出栈的过程， 如果出栈结束后， stack 的长度不为0，则表示还有没匹配的字符，直接返回false

  if (stack.length) {
    return false;
  }

  // 出栈完成， stack 此时应该是[]
  return true;
};

// 测试

let s1 = "()"
let s2 = "()[]{}"
let s3 = "(]"
let s4 = "([])"

console.log(s1, isValid(s1)); //  true
console.log(s2, isValid(s2)); // true
console.log(s3, isValid(s3)) // false
console.log(s4, isValid(s4)) // true

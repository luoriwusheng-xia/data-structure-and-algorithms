import {parseArgs} from 'node:util'

// 也可以使用 process.argv.slice(2) 获取，但是这没有将参数解析为对象
console.log('使用 process解析');
// 这里返回的是数组
console.log(process.argv.slice(2)); // [ '--name', 'vue', '-v', '1.2.32', '--age', '222' ]

// 解析命令行参数
const {values, positionals} = parseArgs({
  // 是否允许使用位置参数
  allowPositionals: true,
  options: {
    // 定义选项的配置
    version: {
      type: "string",
      short: 'v'
    },
    name: {
      // 只有2中类型， string或者 boolean
      type: 'string',
      default: 'react',
      short: 'n'
    },
    age: {
      type: 'string'
    }
  }
})

console.log('使用工具类解析的结果：');

console.log(values); // { name: 'vue', version: '1.2.32', age: '222' }
console.log(positionals); // [] 如果有额外的参数，切没有在 上面 options 中定义，则参数会在这里

// 测试案例
// node 01-2.js  --name vue -v 1.2.3
// node 01-2.js  --name vue -v 1.2.32 --age  222
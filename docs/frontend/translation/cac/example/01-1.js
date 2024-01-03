import cac  from 'cac'

const cli = cac()

// 定义指令

cli.option('--type <type>', '选择一个项目类型', {
  default: 'node',
  // type: [
  //   {}
  // ]
})


cli.option('--name <name>', '提供一个名字')

/**
 * 在没有注册为 bin/下面命令的情况下，可以如下使用
 *
 * node 01-1.js lint package.json
 * 或者多个文件
 * node 01-1.js lint package.json readme.md
 * 会执行下面的 action 动作
 *
 * 会返回如下结果： [ 'package.json', 'readme.md' ] { '--': [], type: 'node' }
 */
cli.command('lint [...files]', '验证文件').action((files, options) => {
  console.log(files, options)
})

/**
 * 在没有注册为 bin/下面命令的情况下，可以如下使用
 *
 * node 01-1.js -h
 * 或者
 * node 01-1.js --help
 */
cli.help()

// 版本号 使用 -v 或者 --version 展示版本号
cli.version("0.0.1")

// 解析命令行参数
const parsed = cli.parse()

// JSON对象
// console.log(parsed);

// 运行  node 01-1.js --type foo 参数
// console.log(JSON.stringify(parsed, null, 2));
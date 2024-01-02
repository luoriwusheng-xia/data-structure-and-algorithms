# cac

> Command And Conquer 是一个用于构建 CLI 应用程序的 JavaScript 库。

## 特点

- 超轻量级：无依赖，只需一个文件。
- 简单易学。构建简单的 CLI 只需要学习 4 个 API： `cli.option` `cli.version` `cli.help` `cli.parse` .
- 非常强大。启用默认命令、类似 git 的子命令、所需参数和选项的验证、可变参数、点嵌套选项、自动帮助消息生成等功能。
- 开发人员友好。用 TypeScript 编写。


## 安装

```shell
npm i cac
```

## 用法

### 简单解析

> 使用 CAC 作为简单的参数解析器：

```js
// examples/basic-usage.js
const cli = require('cac')()

cli.option('--type <type>', 'Choose a project type', {
  default: 'node',
})

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
```

![Alt text](image.png)


### 显示帮助信息和版本号

```js
// examples/help.js
const cli = require('cac')()

cli.option('--type [type]', 'Choose a project type', {
  default: 'node',
})
cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'Lint files').action((files, options) => {
  console.log(files, options)
})

// Display help message when `-h` or `--help` appears
cli.help()
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version('0.0.0')

cli.parse()
```

![Alt text](image-1.png)

### 命令的特定选项options

可以将选项附加到命令上

```js
const cli = require('cac')()

cli
  .command('rm <dir>', 'Remove a dir')
  .option('-r, --recursive', 'Remove recursively')
  .action((dir, options) => {
    console.log('remove ' + dir + (options.recursive ? ' recursively' : ''))
  })

cli.help()

cli.parse()
```

使用命令时，将验证命令的选项。任何未知选项都将报告为错误。

但是，如果基于操作的命令未定义操作，则不会验证选项。如果确实要使用未知选项，请使用 command.allowUnknownOptions .


![Alt text](image-2.png)

### 选项中的破折号 --

> kebab-case 中的选项应在代码的 camelCase 中引用： 意思是，选项中的 -- 在代码中解析成的参数为 camelCase 风格字段

例如： --clear-screen , 在代码中为 clearScreen

```js
cli
  .command('dev', 'Start dev server')
  .option('--clear-screen', 'Clear screen')
  .action((options) => {
    console.log(options.clearScreen)
  })
```

事实上 --clear-screen ，和 --clearScreen 都将解析为 options.clearScreen 字段


### 括号

在命令 `command` 中

- 使用`[]方括号`时, 表示可选参数
- 使用`<>尖括号`, 表示必需的命令参数

在 选项 option 中 使用括号

- `<>尖括号` 表示需要字符串/数字值
- `[]方括号` 表示该值也可以是 true


```js
const cli = require('cac')()

cli
  .command('deploy <folder>', 'Deploy a folder to AWS')
  .option('--scale [level]', 'Scaling level')
  .action((folder, options) => {
    // ...
  })

cli
  .command('build [project]', 'Build a project')
  .option('--out <dir>', 'Output directory')
  .action((folder, options) => {
    // ...
  })

cli.parse()
```

### 否定选项

> 要允许值为 false 的选项，您需要手动指定否定选项

```js
cli
  .command('build [project]', 'Build a project')
  .option('--no-config', 'Disable config file')
  .option('--config <path>', 'Use a custom config file')
```

这将允许 CAC 将默认值 config 设置为 true，您可以使用 --no-config flag 将其设置为 false 。

###  可变参数

命令的最后一个参数可以是可变的，并且只能是最后一个参数。

要使参数可变，您必须添加到 ... 参数名称的开头，就像 JavaScript 中的 rest 运算符一样。
下面是一个示例：


```js
const cli = require('cac')()

cli
  .command('build <entry> [...otherFiles]', 'Build your app')
  .option('--foo', 'Foo option')
  .action((entry, otherFiles, options) => {
    console.log(entry)
    console.log(otherFiles)
    console.log(options)
  })

cli.help()

cli.parse()
```

![Alt text](image-3.png)

### 点嵌套选项

点嵌套 选项`option`将合并为一个选项 `option`

```js
const cli = require('cac')()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .example('--env.API_SECRET xxx')
  .action((options) => {
    console.log(options)
  })

cli.help()

cli.parse()
```

![Alt text](image-4.png)

### 默认命令

注册一个命令，当没有其他命令匹配时将使用该命令。

```js
const cli = require('cac')()

cli
  // Simply omit the command name, just brackets
  .command('[...files]', 'Build files')
  .option('--minimize', 'Minimize output')
  .action((files, options) => {
    console.log(files)
    console.log(options.minimize)
  })

cli.parse()
```

### 提供数组作为选项值

```shell
node cli.js --include project-a
# The parsed options will be:
# { include: 'project-a' }

node cli.js --include project-a --include project-b
# The parsed options will be:
# { include: ['project-a', 'project-b'] }
```

### 错误处理
要全局处理命令错误，请执行以下操作：

```js
try {
  // Parse CLI args without running the command
  cli.parse(process.argv, { run: false })
  // Run the command yourself
  // You only need `await` when your command action returns a Promise
  await cli.runMatchedCommand()
} catch (error) {
  // Handle error here..
  // e.g.
  // console.error(error.stack)
  // process.exit(1)
}
```

### 使用typescript

首先，您需要 @types/node 在项目中作为开发依赖项安装：

```shell
yarn add @types/node --dev
```

```shell
const { cac } = require('cac')
// OR ES modules
import { cac } from 'cac'
```

### 在deno中使用

```js
import { cac } from 'https://unpkg.com/cac/mod.ts'

const cli = cac('my-program')
```

## 使用 cac 的项目

## 引用

## FAQ 常见问题



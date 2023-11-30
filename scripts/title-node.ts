/**
 * 当前程序使用 tsx 代码运行
 *
 * npx tsx title-node.ts
 */

import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token"

let text = `# 一级标题`

let md = new MarkdownIt()

// let ast = md.parse(text, {})

// console.log(JSON.stringify(ast));

// 创建 h1 开始标签
let headingOpenToken = new Token('heading_open', 'h1', 1)

// 一定要设置这个，这是markdown 语法标记
headingOpenToken.markup = '#'

// 注意，这里关闭标签，第三个参数传 -1
let headingCloseToken = new Token('heading_close', 'h1', -1)
headingCloseToken.markup = '#'

let inlineToken = new Token('inline', '', 0)

inlineToken.content = '一级标题'
inlineToken.level = 1

// 创建文本节点
let textToken = new Token('text', '', 0)
textToken.content = '一级标题'

// 将文本节点添加到 inline 节点里面
inlineToken.children = [
  textToken
]


// 按照顺序，组成 token
let tokens = [
  headingOpenToken,
  inlineToken,
  headingCloseToken
]

let html = md.renderer.render(tokens, {}, null)

console.log(html);

/**
 * 当前程序使用 tsx 代码运行
 *
 * npx tsx pic-node.ts
 */

import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token"

let text = `![图片](./1.png)`

let md = new MarkdownIt()

let ast = md.parse(text, {})

console.log(ast);

// markdown里面所有图片是单独一行的
let inlineTag = new Token('inline', '', 0)

let imgTag = new Token('image', 'img', 0)
imgTag.attrs = [
  [
    'src', './1.png'
  ],
  [
    'alt', '可以为空'
  ]
]

imgTag.content = '图片内容'

let imgChild1 = new Token('text', '', 0)
imgChild1.content = '图片'

imgTag.children = [imgChild1]

inlineTag.children = []

inlineTag.children.push(imgTag)

// console.log(inlineTag);


// 将 Token 数组转换为 HTML 字符串
const html = md.renderer.render([inlineTag], {}, null);

console.log(html);

import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token"

let text = `
### [\#](#_10-页面重构怎么操作){.header-anchor} 10 页面重构怎么操作 {#_10-页面重构怎么操作}

- 你好

是的， 我是正文
`

let text2 = `### [\#](#_10-页面重构怎么操作){.header-anchor} 10 页面重构怎么操作 {#_10-页面重构怎么操作}`

let md = new MarkdownIt()

let ast = md.parse(text, {})







// console.log(JSON.stringify(ast[1]));
console.log(JSON.stringify(ast));


// let html = md.renderer.render(ast)

// console.log(html);

const f1 = (ast:Array<Token>) => {

  ast.forEach((item, index) => {
    if(item.type === 'heading_open' ) {
      // 处理标题的正文内容
      let target = ast[index + 1]
      console.log(target);
    }

  })

}

// f1(ast)
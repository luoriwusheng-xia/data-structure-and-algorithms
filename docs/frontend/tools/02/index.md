# markdown-it

### 将markdown里面的标题替换为目标内容

```js
import markdownit from 'markdown-it'

var md = new markdownit();
var markdownText = '# 标题1';
var ast = md.parse(markdownText, {});

function traverse(node) {
  if (node.type === 'heading_open' && node.tag === 'h1') {
    // 替换标题1的内容
    node?.children.forEach(child => {
      if (child.type === 'text') {
        child.content = '《' + child.content + '》';
      }
    });
  }

  if (node.children) {
    node.children.forEach(child => {
      traverse(child);
    });
  }
}

traverse(ast);

// 将修改后的AST转换回Markdown文本
let result = md.renderer.render(ast, {})

// <h1>标题1</h1>
console.log(result);
```
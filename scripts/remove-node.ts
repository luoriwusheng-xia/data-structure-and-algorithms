import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token"

// 创建一个新的 MarkdownIt 实例
const md = new MarkdownIt();

const removeH1Plugin = (md: MarkdownIt) => {
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.tag === 'h1') {
      // 删除H1节点
      return '';
    }
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.tag === 'h1') {
      // 删除H1节点
      return '';
    }
    return self.renderToken(tokens, idx, options);
  };
};


md.use(removeH1Plugin)

const markdownText = '# 标题1\n\n正文内容';
const html = md.render(markdownText);
console.log(html);

// 结果
// 标题1<p>正文内容</p>
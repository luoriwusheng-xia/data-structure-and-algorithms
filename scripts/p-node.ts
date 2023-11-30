import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token"

// 创建一个新的 MarkdownIt 实例
const md = new MarkdownIt();

// 创建一个包含 <p> 是的 </p> 的 Token
const openTagToken = new Token('paragraph_open', 'p', 1);
const textToken = new Token('text', '', 0);
textToken.content = '是的';
const closeTagToken = new Token('paragraph_close', 'p', -1);

// 将 Token 组合成一个 Token 数组
const tokens = [openTagToken, textToken, closeTagToken];

// 将 Token 数组转换为 HTML 字符串
const html = md.renderer.render(tokens, {}, null);




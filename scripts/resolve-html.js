import fs from 'fs';
import TurndownService from 'turndown';
import prettier from 'prettier';
import { JSDOM } from 'jsdom';

let url = `
https://interview.poetries.top/docs/excellent-docs/10-%E7%A7%BB%E5%8A%A8%E5%A4%9A%E7%AB%AF%E5%BC%80%E5%8F%91.html`;

/**
 * 完整的解析流程
 * 1. 先登录那个平台
 * 2. netword 拿到页面的请求地址
 * 3. 使用下面的替换
 * 4. node 执行本地的入口
 * 5. 将 pre-data 里面的 md文件替换到 doc 目录对应的章节
 *
 */

// http 请求这个地址

const useRegReplace = () => {
  // // 删除
  // // 移除 <head> 标签及其内容
  // t2 = t2.replace(/<head[\s\S]*?>[\s\S]*?<\/head>/gi, '');
  // // 移除 <header> 标签及其内容
  // t2 = t2.replace(/<header[\s\S]*?>[\s\S]*?<\/header>/gi, '');
  // t2 = t2.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
  // // 删除 <div class="page-nav"> 标签及其内容
  // t2 = t2.replace(/<div class="page-nav"[^>]*>[\s\S]*?<\/div>/gi, '');
  // // 删除 <div class="location"> 标签及其内容
  // t2 = t2.replace(/<div class="location"[^>]*>[\s\S]*?<\/div>/gi, '');
  // // 删除 <div class="content-lock btn-wrap"> 标签及其内容
  // t2 = t2.replace(
  //   /<div class="content-lock btn-wrap"[^>]*>[\s\S]*?<\/div>/gi,
  //   ''
  // );
  // // 删除 <footer> 标签及其内容
  // t2 = t2.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  // t2 = t2.replace(/<div class="el-dialog__wrapper"[^>]*>[\s\S]*?<\/div>/gi, '');
  // t2 = t2.replace(/<div class="readMore-wrapper"[^>]*>[\s\S]*?<\/div>/gi, '');
};

const getTextContent = async () => {
  const text = await fetch(url);

  let t2 = await text.text();

  // 使用 jsdom 解析 HTML
  const dom = new JSDOM(t2);

  const document = dom.window.document;

  // 删除 <footer> 标签
  const footer = document.querySelector('footer');
  if (footer) {
    footer.remove();
  }
  const aside = document.querySelector('aside');
  if (aside) {
    aside.remove();
  }

  const header = document.querySelector('header');
  if (header) {
    header.remove();
  }
  const globalUI = document.querySelector('.global-ui');
  if (globalUI) {
    globalUI.remove();
  }

  // 删除所有的 script
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script) => script.remove());

  // 删除 class="page-nav" 的 <div>
  const pageNav = document.querySelector('div.page-nav');
  if (pageNav) {
    pageNav.remove();
  }

  // 删除 class="location" 的 <div>
  const locationDiv = document.querySelector('div.location');
  if (locationDiv) {
    locationDiv.remove();
  }

  // 删除 class="content-lock btn-wrap" 的 <div>
  const contentLockDiv = document.querySelector('div.content-lock.btn-wrap');
  if (contentLockDiv) {
    contentLockDiv.remove();
  }

  const readMore = document.querySelector('div.readMore-wrapper');
  if (readMore) {
    readMore.remove();
  }

  const drawer__wrapper = document.querySelector('div.el-drawer__wrapper');
  if (drawer__wrapper) {
    drawer__wrapper.remove();
  }

  const dialogList = document.querySelectorAll('div.el-dialog__wrapper');

  dialogList.forEach((item) => item.remove());

  const head = document.querySelector('head');
  if (head) {
    head.remove();
  }

  // 测试查看生成后的产物
  // fs.writeFileSync('./pre-data/222.html', dom.serialize(), 'utf8');

  return dom.serialize();
};

// html在 根目录的 pre-data里面

// 定义输入的根目录
const basePath = './pre-data';

const turndownService = new TurndownService();

// 自定义规则处理代码块
turndownService.addRule('codeBlock', {
  filter: function (node) {
    // 检查 node 是否是 DIV、PRE 或者 CODE，并且父节点是 PRE 或 DIV
    return (
      (node.nodeName === 'DIV' ||
        node.nodeName === 'PRE' ||
        (node.nodeName === 'CODE' &&
          node.parentNode &&
          (node.parentNode.nodeName === 'PRE' ||
            node.parentNode.nodeName === 'DIV'))) &&
      // 检查 class 中是否包含适当的语言标识，例如 js、css、html、txt 等
      (node.classList.contains('language-js') ||
        node.classList.contains('language-css') ||
        node.classList.contains('language-html') ||
        node.classList.contains('language-txt') ||
        (node.parentNode &&
          (node.parentNode.classList.contains('language-js') ||
            node.parentNode.classList.contains('language-css') ||
            node.parentNode.classList.contains('language-html') ||
            node.parentNode.classList.contains('language-txt'))))
    );
  },
  replacement: function (content, node) {
    let codeContent = '';

    let language = '';

    let list = Array.from(node.classList);
    for (let cItem of list) {
      if (cItem.indexOf('language-') > -1) {
        language = cItem.replace('language-', '');
      }
    }

    console.log('language', language);

    if (node.nodeName === 'CODE') {
      // 提取 CODE 元素的文本内容（去掉所有 HTML 标签）
      codeContent = node.textContent;
    } else if (node.nodeName === 'PRE') {
      // 提取 PRE 元素下的代码内容
      const codeElement = node.querySelector('code');
      codeContent = codeElement ? codeElement.textContent : node.textContent;
    } else if (node.nodeName === 'DIV') {
      // 提取 DIV 元素下的代码内容
      const preElement = node.querySelector('pre');
      if (preElement) {
        const codeElement = preElement.querySelector('code');
        codeContent = codeElement
          ? codeElement.textContent
          : preElement.textContent;
      } else {
        codeContent = node.textContent;
      }
    }

    return '```' + language + '\n' + codeContent + '\n```';
  },
});

turndownService.addRule('removeAnchorFromHeadings', {
  filter: 'a',
  replacement: function (content, node) {
    const parent = node.parentNode;
    // console.log(parent.tagName);

    if (parent) {
      if (['H3', 'H4', 'H5', 'H6'].includes(parent.tagName)) {
        return '';
      } else if ('H2'.includes(parent.tagName)) {
        return `#` + node.textContent.trim();
      }
    }
    return node.textContent;
  },
});

async function main() {
  // 处理 HTML 内容，格式化代码块

  const text = await getTextContent();

  // 将 HTML 转换为 Markdown
  const mdContent = turndownService.turndown(text);
  // 写入 MD 文件
  fs.writeFile('./pre-data/01.md', mdContent, 'utf8', (err) => {
    if (err) {
      // console.error('写入 MD 文件时出错: ', err);
      return;
    }
    // console.log('HTML 已成功转换为 MD 文件。');
  });
}

main();

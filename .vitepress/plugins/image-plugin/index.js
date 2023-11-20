import Viewer from 'viewerjs'
import "viewer/dist/viewer.min.css"

export default function (md) {
  // console.log(md);
  console.log( md.renderer.rules);
  md.renderer.rules['image'] = function(tokens, idx, options, env, slf) {
    console.log(typeof window);
    console.log('2222');
    // console.log(tokens);
    // 请 借助viewer 实现图片的预览 需要AI 实现
    // const viewer = new Viewer(window.document.body, {
    //   url: tokens[idx].content, // 图片的URL
    //   container: window.document.getElementById('container'), // 预览窗口的容器元素
    //   toolbar: true, // 是否显示工具栏
    //   title: false, // 是否显示标题
    //   navbar: false // 是否显示导航栏
    // });
    return ''
  }

}
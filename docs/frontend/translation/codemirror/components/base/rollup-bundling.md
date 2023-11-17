# 使用rollup打包

CodeMirror 作为模块集合分发。这些模块不能由浏览器直接加载，尽管现代浏览器可以加载 EcmaScript 模块，但在编写本文时，它们用于解析进一步依赖关系的机制仍然过于原始，无法加载 NPM 分布式模块的集合。

（话虽如此，有一些解决方案可以通过重写服务器端的依赖项来解决这个问题，例如 Snowpack 或 esmoduleserve。在开发过程中，我绝对推荐这样的解决方案，因为它在更改文件时往往会引入较少的间接性和延迟，但对于实际部署，您暂时需要进行经典捆绑。

打包器是采用给定主脚本（或在某些情况下是多个脚本）并生成一个新的、通常更大的脚本的工具，该脚本包含脚本的所有（或部分）依赖项（及其依赖项等）。这使得在浏览器中运行现代 JavaScript 系统变得更加容易，这些系统往往由整个依赖关系图组成。（但是，例如，在将库包上传到 NPM 之前，将编写为一组文件的库包合并到单个文件中。

就捆绑软件而言，我是 Rollup 的忠实粉丝。但也有其他系统，如 Webpack 和 Parcel，它们运行良好并具有自己的优势。

要使用 Rollup 创建加载 CodeMirror 的捆绑包，您必须首先编写一个主脚本（例如， editor.mjs ），用于导入库并创建编辑器视图。

```js
import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

let editor = new EditorView({
  extensions: [basicSetup, javascript()],
  parent: document.body
})
```

接下来，我们必须安装必要的软件包。该 `@rollup/plugin-node-resolve` 包是教 rollup 解析节点样式依赖项所必需的，以便它知道在 `node_modules/@codemirror/lang-javascript/dist/index.js` 下查找 `"@codemirror/lang-javascript"` 。


```bash
npm i codemirror @codemirror/lang-javascript

npm i rollup @rollup/plugin-node-resolve
```

有了这些，我们可以运行 rollup 来创建捆绑文件。

```bash
node_modules/.bin/rollup editor.mjs -f iife -o editor.bundle.js \
  -p @rollup/plugin-node-resolve
```

该文件 -f iife 告诉 Rollup，输出文件的格式应为“立即调用的函数表达式”（与其他模块样式相反，例如 CommonJS 或 UMD）。这意味着代码将被包装在一个匿名函数中，然后立即调用该函数，使用该函数的作用域作为本地命名空间，以便其变量不会最终进入全局范围。

该选项指示要写入的输出文件，该 -o -p 选项加载分辨率插件。您还可以创建一个配置文件（称为 rollup.config.mjs ），然后运行 rollup -c 以从该文件中获取配置。


```js
import {nodeResolve} from "@rollup/plugin-node-resolve"
export default {
  input: "./editor.mjs",
  output: {
    file: "./editor.bundle.js",
    format: "iife"
  },
  plugins: [nodeResolve()]
}
```

现在，如果您使用脚本标签加载捆绑包，您将在 HTML 页面中看到编辑器。


```html
<!doctype html>
<meta charset=utf8>
<h1>CodeMirror!</h1>
<script src="editor.bundle.js"></script>
```

### 打包大小

因为该库是 JavaScript 工程的十万行奇迹，附带了完整的源代码（包括注释和空格），所以以最直接的方式构建的捆绑包可能会变得有些大（基本设置和语言模式约为 1 兆字节）。通过使用 Terser 或 Babel 之类的东西来剥离注释和空格，并重命名变量以使用较短的名称，可以将整个捆绑包减少到大约 400 KB（当 gzip 压缩以通过网络传输时为 135 KB），您可以将其减少一半以上。

该库的构建方式是，像 Rollup 这样的智能打包器可以消除未使用的代码（一种称为“摇树”的功能）。最小的编辑器（见下文）避免加载一堆扩展，将完整的捆绑包大小减少到 700 KB，并将剥离的代码减少到 250 KB（75 KB gzip 压缩）。

```js
import {EditorView, minimalSetup} from "codemirror"

let editor = new EditorView({
  extensions: minimalSetup,
  parent: document.body
})
```

当您需要支持多种语言时，根据需要动态加载语言支持包通常很有用，以避免浏览器必须加载的代码量。汇总文档可以告诉您有关如何执行此操作的详细信息。


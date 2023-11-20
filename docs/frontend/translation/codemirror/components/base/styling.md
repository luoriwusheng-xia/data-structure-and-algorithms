# 样式

CodeMirror 使用 CSS-in-JS 系统，能够将其样式直接包含在脚本文件中。这意味着您不必在页面中包含库 CSS 文件即可使编辑器正常工作 - 编辑器视图自己的样式和为依赖项定义的任何样式都会通过 JavaScript 模块系统自动拉入。

主题只是扩展，它告诉编辑器挂载一个额外的样式模块，并将启用这些样式的（生成的）类名添加到其外部 DOM 元素中。

## 老式的CSS


编辑器中的重要元素具有常规的（非生成的）CSS 类名，可以使用手动编写的样式表来定位这些类名。例如，外部元素具有类 cm-editor 。

但是，库注入的 CSS 规则将以额外生成的类名为前缀，以便它们仅在显式启用时才适用。这意味着，如果需要覆盖它们，则必须注意使自己的规则至少与注入的规则一样具体，例如，在它们前面加上 .cm-editor .它们只需要尽可能具体，而不需要更具体，因为注入的规则放在任何其他样式表之前，因此默认优先级低于规则。


```css
.cm-editor.cm-focused { outline: 2px solid cyan }
.cm-editor .cm-content { font-family: "Consolas" }
```

请注意，该规则直接应用于将具有该 cm-focused cm-editor 类的元素，因此选择器之间不需要空格，而 cm-content 规则确实需要空格，因为它适用于编辑器中的节点。

## 自定义样式

编辑器（带有装订线并 drawSelection 启用）具有如下 DOM 结构：

```html
<div class="cm-editor [cm-focused] [generated classes]">
  <div class="cm-scroller">
    <div class="cm-gutters">
      <div class="cm-gutter [...]">
        <!-- One gutter element for each line -->
        <div class="cm-gutterElement">...</div>
      </div>
    </div>
    <div class="cm-content" contenteditable="true">
      <!-- The actual document content -->
      <div class="cm-line">Content goes here</div>
      <div class="cm-line">...</div>
    </div>
    <div class="cm-selectionLayer">
      <!-- Positioned rectangles to draw the selection -->
      <div class="cm-selectionBackground"></div>
    </div>
    <div class="cm-cursorLayer">
      <!-- Positioned elements to draw cursors -->
      <div class="cm-cursor"></div>
    </div>
  </div>
</div>
```

当然，设置编辑器样式的方式是有限制的。像制作编辑器行 display: inline 或光标这样的事情 position: fixed 只会破坏东西。但在合理的范围内，该库在样式方面试图变得健壮。

- 您可以使用不同的字体、大小、颜色等设置内容文本的样式。编辑器不需要等宽字体或固定行高。
- 若要设置文档的外部填充，请向 添加垂直填充 cm-content 和水平填充 cm-line 。
- 默认情况下，编辑器会调整到其内容的高度，但您可以使 cm-scroller overflow: auto 和 分配 height or max-height to cm-editor ，以使编辑器可滚动。
- 颜色可以自始至终进行调整，但在为内容添加背景色时，建议使用部分透明的颜色。这样一来，这样的样式就不会隐藏其背后的其他样式（包括选择）。
- 编辑器中的空格行为可以是 pre 或 pre-wrap 控制换行。（换行扩展只是将其设置为 pre-wrap 。
- 编辑器的文本方向自动从内容 DOM 的 direction 样式派生出来。
- 该库支持将 CSS 转换应用于执行 2D 缩放和平移的父元素。其他任何操作（旋转、3D 变换、剪切）都会破坏编辑器。


## 主题


主题用 EditorView.theme 定义。该函数采用一个对象，其属性是 CSS 选择器，其值是样式，并返回安装主题的扩展。

```js
import {EditorView} from "@codemirror/view"

let myTheme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#034"
  },
  ".cm-content": {
    caretColor: "#0e9"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#0e9"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#074"
  },
  ".cm-gutters": {
    backgroundColor: "#045",
    color: "#ddd",
    border: "none"
  }
}, {dark: true})
```

这里发生了一些事情。首先，一些规则包含“ & ”占位符。这表示外部编辑器元素在规则中的位置。默认情况下，生成的类名以规则为前缀，其后有一个空格（因此 ".cm-content" 变为 ".gen001 .cm-content" ）。但是在直接针对外部元素（获取生成的类）的规则中，这是行不通的，您必须放置一个 & 字符来指示在何处插入类选择器。

其次，由于在 CodeMirror 中有两种显示所选内容的方式（本机选择和 drawSelection 扩展），因此主题通常希望同时设置两者的样式 - and 规则适用于本机选择，而 caret-color .cm-cursor and .cm-selectionBackground ::selection 规则则设置库绘制的所选内容的样式。

真正的主题需要设置更多内容的样式，包括由扩展创建的元素（例如面板和工具提示）。您通常还希望在主题中包含突出显示样式。您可以查看 One Dark 主题作为示例，并可能复制和修改它以创建您自己的主题。

## 基础主题

当您创建一个向编辑器添加一些新 DOM 结构的扩展时，您通常希望包含一个为元素提供默认样式的基本主题。基本主题的作用与常规主题非常相似，只是它们的安装优先级较低，并且可以为深色和浅色主题提供单独的规则。



例如，用蓝色圆圈替换字母 o 的所有实例的假设扩展可能希望包含如下基本主题......

```js
import {EditorView} from "@codemirror/view"

let baseTheme = EditorView.baseTheme({
  ".cm-o-replacement": {
    display: "inline-block",
    width: ".5em",
    height: ".5em",
    borderRadius: ".25em"
  },
  "&light .cm-o-replacement": {
    backgroundColor: "#04c"
  },
  "&dark .cm-o-replacement": {
    backgroundColor: "#5bf"
  }
})
```

&dark and &light 占位符的作用与 & 非常相似，只是它们扩展到一个类，该类仅在编辑器的主题为浅色或深色时启用。在这种情况下，基本主题在深色主题中为其圆圈提供更亮的颜色（假设那里的背景会更暗）。

必须将返回的 baseTheme 扩展添加到编辑器配置中才能（可靠地）生效 - 样式规则只有在创建使用它们的编辑器时才会挂载到 DOM 中。它通常与其他相关扩展捆绑在一个数组中，并从生成功能扩展的导出函数返回（例如，请参阅斑马条纹示例）。


## 高亮

代码突出显示使用的系统与编辑器范围的主题略有不同。代码样式也是使用 JavaScript 创建的，并通过编辑器扩展启用。但默认情况下，它们不使用稳定的、未生成的类名。突出显示样式直接返回语法标记的类名。

突出显示：将突出显示标签与样式相关联。例如，这个为关键字和评论分配样式。

```js
import {tags} from "@lezer/highlight"
import {HighlightStyle} from "@codemirror/language"

const myHighlightStyle = HighlightStyle.define([
  {tag: tags.keyword, color: "#fc6"},
  {tag: tags.comment, color: "#f5d", fontStyle: "italic"}
])
```

提供给 HighlightStyle.define 的每个对象都提到一个标记（由语言包分配给令牌），并且包含样式属性，就像主题中的对象一样。

在定义编辑器主题时，您通常希望同时提供主题扩展和看起来不错的突出显示样式。将突出显示样式（或其他突出显示器）包裹起来 syntaxHighlighting ，以创建启用该样式的扩展。

```js
import {syntaxHighlighting} from "@codemirror/language"

// In your extensions...
syntaxHighlighting(myHighlightStyle)
```


如果您需要使用普通的旧 CSS 设置标记的样式，则可以使用 ，它只是将静态类（例如 cmt-keyword ）添加到标记中 classHighlightStyle ，而无需为该类定义任何规则。

## 滚动和溢出 Overflow and Scrolling
在没有任何自定义样式的情况下，CodeMirror 编辑器会垂直增长，滚动（而不是换行）长行，并且除了聚焦时的焦点环外，没有任何边框。

若要启用换行，请将 EditorView.lineWrapping 扩展添加到配置中。也可以以其他方式调整内容元素的 white-space 样式，但只有 pre 和 pre-wrap 被库支持，如果不同时设置 overflow-wrap: anywhere ，包装可能不可靠，因此建议仅使用此扩展来启用包装。

调整编辑器的垂直行为可以通过为其外部元素指定高度并在滚动条元素上进行设置 overflow: auto 来完成。

```js
const fixedHeightEditor = EditorView.theme({
  "&": {height: "300px"},
  ".cm-scroller": {overflow: "auto"}
})
```

要让编辑器增长到达到最大高度，并从那时起滚动，请使用 max-height 而不是 height 在上面的设置中。

由于一些晦涩难懂的 CSS 限制，给编辑器一个最小高度有点复杂——你必须将这个高度分配给内容和装订线元素，而不是包装元素，以确保它们占据编辑器的整个高度。


```js
const minHeightEditor = EditorView.theme({
  ".cm-content, .cm-gutter": {minHeight: "200px"}
})
```
# API

## demo

- [案例](./02)

## Token

```js
new Token(type, tag, nesting)
```

- type: string Token的类型， 有很多内置类型 参照下面的 [type](/docs/frontend/tools/02/#type)
- tag: string  标签类型
- nesting: [Token.Nesting](/docs/frontend/tools/02/#token-nesting) 标志标签的属于哪种， 闭合/自闭合

### 属性

#### type

- paragraph_open  段落 \<p>
- paragraph_close 段落闭合标签 \</p>
- text 纯文本
- inline
- image
- heading_open 标题
- heading_close 标题关闭标签
- ...

#### tag
标签

- p
- span
- h1~h6
- img

#### Token.Nesting

- `1` 表示是开始标签
- `0` 表示自闭合标签
- `-1` 表示结束标签

### 方法


---


# gsap

## 术语

### 补间动画/过渡动画 （tweens）
> 在动画特效中，"tweens" 通常指的是一种技术或方法，用于创建平滑的过渡效果。它可以将一个对象从一个位置、大小、旋转等状态过渡到另一个状态，使动画更加流畅自然。因此，在中文中，我们可以将其翻译为“补间动画”或者“过渡动画”。

#### 补间动画 API

##### gsap.to()
> 这是最常见的补间类型。补间将从元素的当前状态开始，并对补间中定义的值进行动画处理。

##### gsap.from()

>  就像向后一样，它对补间中定义的值进行“自”动画处理，并在元素的当前状态结束
##### gsap.fromTo()

>  您可以定义起始值和结束值。

##### gsap.set()

> 立即设置属性（无动画）。它本质上是一个零持续时间的补间


### 语法简写

```css
transform: rotate(360deg) translateX(10px) translateY(50%);
```

```js
gsap.to('.box', {
  { rotation: 360, x: 10, yPercent: 50 }
})
```

### 哪些可以支持

gsap 中 所有东西都可以成为动画


#### css属性

变换，颜色，填充，边界半径，GSAP可以将其全部动画化！只需记住camelCase属性-例如背景颜色变为backgroundColor。

::: danger
虽然GSAP可以制作几乎所有CSS属性的动画，但我们建议尽可能使用转换(transform)和不透明度(opacity)。

对于浏览器渲染来说，滤镜(filter)和阴影(box-shadow)等属性是CPU密集型的。小心制作动画，并确保在低端设备上进行测试。
:::

#### SVG 属性

就像HTML元素一样，SVG元素可以通过变换简写来设置动画。此外，您还可以使用attr对象设置SVG属性的动画，如width、height、fill、stroke、cx、opacity甚至SVG本身。


#### 任何数值、颜色或包含数字的复杂字符串
当我们说任何东西时，我们意味着任何东西。GSAP甚至不需要DOM元素来设置动画属性。你可以从字面上针对任何对象的任何属性，甚至是任意创建的属性，就像这样

```js
//create an object
let obj = { myNum: 10, myColor: "red" };

gsap.to(obj, {
  myNum: 200,
  myColor: "blue",
  onUpdate: () => console.log(obj.myNum, obj.myColor)
});
```

使用 `onUpdate` 一样能跟踪到一个普通对象的变化过程， 我们前面操作的都是 DOM， SVG， canvas等， 这里是一个原生的js对象

<<<./demo/updatelog.txt


#### Canvas

在下面的演示中，我们使用HTML画布绘制了一个方框。我们为存储在位置对象中的x和y值设置动画，然后在动画的每个刻度上更新画布。

GSAP经常以这种方式用于在Three.js、HTML画布和Pixi.js中制作动画


这就是为啥，上面要去改对象的值，而不是直接去改 canvas 的值， 具体看下面的案例demo

## 注意事项

1. gsap是通过 `document.querySelectorAll()` 获取DOM元素的， 所以，我们如果在vue中使用，哪怕是写了 `scoped` 是不顶用的， 最好是通过 `ref` 去获取DOM 对象，这样可以将查询范围限定在单个组件范围内，避免 class 或者 id 在跨组件重名，导致非期望的元素在动
2. gsap 是可以传入 选择器，查询DOM元素的 `.box > .test` 这样的

## 案例

- [案例](/docs/frontend/essay/animation/02/case)


## 参考案例

- [十分钟教你用svg做出精美的动画！](https://juejin.cn/post/6930412294149472269)
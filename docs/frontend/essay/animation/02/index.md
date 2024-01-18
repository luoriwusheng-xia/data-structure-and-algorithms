# gsap

<script setup>
  import demo01 from './demo/01.vue'

</script>

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

#### css属性

变换，颜色，填充，边界半径，GSAP可以将其全部动画化！只需记住camelCase属性-例如背景颜色变为backgroundColor。


#### SVG 属性

#### Canvas

#### 任何数值、颜色或包含数字的复杂字符串

## 案例

### 1. 基础移动

<demo01></demo01>

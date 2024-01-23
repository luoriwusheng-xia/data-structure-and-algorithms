# 案例
<script setup>
  import demo01 from './demo/01.vue'
  import demo011 from './demo/01-1.vue'
  import demo012 from './demo/01-2.vue'

  import demo02 from './demo/02.vue'
  import demo03 from './demo/03.vue'
  import demo04 from './demo/04.vue'
  import demo05 from './demo/05.vue'
  import demo06 from './demo/06.vue'
  import demo07 from './demo/07.vue'
  import demo08 from './demo/08.vue'
  import demo09 from './demo/09.vue'

</script>

### 1. 基础移动

<demo01></demo01>

<<<./demo/01.vue

### 1.1 对一个普通js对象做动画更新

<demo011/>

### 1.2 操作canvas的动画

这里跟操作上面的js普通的对象是有关联的， 我们本质是在更新这个普通对象，对 canvas只是不断的调用了重绘的方法而已

<demo012></demo012>

### 2. 溜溜球效果

溜溜球效果，就是一个动画过去，还会回弹回来， 动画怎么过去的， yoyo: true， 就怎么回来

`yoyo` 和 `repeat` 一般是搭配使用
<demo02></demo02>


### 3. 无限重复的动画

只要设置 repeat: -1 就可以无限重复

<demo03></demo03>

### 4. delay 延迟

延迟，可以让 A, B， C 目标对象之间保持一定的顺序， 但是有点繁琐， 以为，只要一个delay时间改变，为了让动画的连贯性，后续的目标对象的 delay时间都需要进行调整，比较繁琐； 这种情况，使用 `Timeline` 会方便很多

<demo04/>

<demo05/>

### 5. 时间线 Timeline

<demo06></demo06>

### 6. 缓动函数

有各种各样的 内置 缓动函数， 通过 `ease` 配置告知 `gsap` 我们要使用什么缓动函数

<demo07 />

### 7. stagger 交错

<demo08 />

<demo09 />
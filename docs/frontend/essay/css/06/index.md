# 六边形布局

<script setup>
  import demo1 from './demo/01.vue'
  import demo2 from './demo/02.vue'
</script>

## 源码
<demo1></demo1>

里面使用了 vw单位，所以无法直接放在vue文件里面，因为vitepress 有左右的导航栏等，会计算有问题

修改了源码以后，使用以下命令编译

```shell
npx sass ./public/06/06.scss ./public/06/06.css
```

::: code-group

<<<./demo/06.html

<<<./demo/06.scss
:::

### 裁剪 clip-path

<demo2></demo2>


## 知识点

- 六边形，需要利用css的 `裁剪`  [在线裁剪工具](http://tools.jb51.net/code/css3path)
- 需要找到对应的位置进行偏移，偏移的目的是让画面看起来更像  蜂窝状
- 六边形默认是挨的比较紧凑，调整 clip-path的值，主要是调整左右2边 4个点的x轴坐标，就可以，同一侧的2个点，Y轴的值应该一样，否则图形是变形的

### sass使用除法

错误的

```scss
$w: 10px;

.a {
  width: $w / 2
}
```
sass 1.69.7 目前测试是无法编译通过的。 以为 css的发展，导致sass无法区分用户到底是要使用 / 除法还是使用 css 原生的分隔符


正确的

```scss
@use "sass:math";

$w: 10px;

.a {
  width: math.div($w, 2)
}

.b {
  width: math.div(-$w, 2)
}
```

负数，是不能将 `-` 放在 `math.div` 前面的
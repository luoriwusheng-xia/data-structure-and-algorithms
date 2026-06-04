# gulp

<script setup>
  import shopRepoInfo from './showRepoInfo.vue'
</script>

<shopRepoInfo />

- [gulpjs-官网](https://gulpjs.com/)

- 使用 API创建任务，更加灵活
- 可任意组合
- 可以在内存中操作内容，速度更快，然后再写入磁盘

## 创建任务
> 注意： 下面的语法均为 ES Module ， 所以，需要指定当前 `package.json` 里面的 `type: "module"`

### 分类

- 公共任务: 直接在gulpfile.js 里面导出的， 可以通过 npx gulp 任务名  直接执行的
- 私有任务： 私有任务，就是没有在 gulpfile.js 里面导出的方法/函数

### 默认任务


gulpfile.js

```javascript
const defaultTask = (cb) => {
  console.log('默认会执行的任务');

  cb()
}

export default defaultTask
```

当我们运行  `npx gulp` 其实是等价于  `npx gulp default` 运行默认的任务

```bash
PS D:\owner\gulp-lesson\01> npx gulp
[13:58:49] Using gulpfile D:\owner\gulp-lesson\01\gulpfile.js
[13:58:49] Starting 'default'...
默认会执行的任务
[13:58:49] Finished 'default' after 1.9 ms
```

```bash
PS D:\owner\gulp-lesson\01> npx gulp default
[13:59:41] Using gulpfile D:\owner\gulp-lesson\01\gulpfile.js
[13:59:41] Starting 'default'...
默认会执行的任务
[13:59:41] Finished 'default' after 1.95 ms
```

### 查看当前 gulpfile 里面导出的任务

```javascript
npx gulp --tasks
```

```text
PS D:\owner\gulp-lesson\01> npx gulp --tasks
[13:57:48] Tasks for D:\owner\gulp-lesson\01\gulpfile.js
[13:57:48] └── default
```

### 自定义任务


```javascript
import gulp from 'gulp'

const {series} = gulp

const transplie = (cb) => {
  console.log(1, '编译');
  cb()
}

const bundle = (cb) => {
  console.log(2, '打包');
  cb()
}

export const build = series(transplie, bundle)

export const test111 = series(transplie)
```

依旧可以查看导出的任务

```bash
npx gulp --tasks
```

```bash
PS D:\owner\gulp-lesson\02> npx gulp --tasks
[14:04:12] Tasks for D:\owner\gulp-lesson\02\gulpfile.js
[14:04:12] ├─┬ build
[14:04:12] │ └─┬ <series>
[14:04:12] │   ├── transplie
[14:04:12] │   └── bundle
[14:04:12] └─┬ test111
[14:04:12]   └─┬ <series>
[14:04:12]     └── transplie
```

现在看到有2个自定义任务， 可以指定要执行的任务， 任务名称其实是开发者自己定义的， 没有约束

```bash
npx gulp build
```

```bash
PS D:\owner\gulp-lesson\02> npx gulp build
[14:06:01] Using gulpfile D:\owner\gulp-lesson\02\gulpfile.js
[14:06:01] Starting 'build'...
[14:06:01] Starting 'transplie'...
1 编译
[14:06:01] Finished 'transplie' after 1.53 ms
[14:06:01] Starting 'bundle'...
2 打包
[14:06:01] Finished 'bundle' after 853 μs
[14:06:01] Finished 'build' after 5.13 ms
```

```bash
npx gulp test111
```

```bash
PS D:\owner\gulp-lesson\02> npx gulp test111
[14:07:03] Using gulpfile D:\owner\gulp-lesson\02\gulpfile.js
[14:07:03] Starting 'test111'...
[14:07:03] Starting 'transplie'...
1 编译
[14:07:03] Finished 'transplie' after 1.54 ms
[14:07:03] Finished 'test111' after 3.79 ms
```

### 组合任务

当我们有一个任务，在多个任务之前都要执行，执行的次数问题

错误示范

```javascript
import gulp from 'gulp'

const { series, parallel } = gulp

const clean = function (cb) {
  console.log('执行清除动作');
  // body omitted
  cb();
};

// 串行
const css = series(clean, function (cb) {
  // body omitted
  console.log('css 编译');
  cb();
});

// 串行
const javascript = series(clean, function (cb) {
  // body omitted
  console.log('js编译');
  cb();
});

// 并行
export const build = parallel(css, javascript);
```


```bash
npx gulp build
```

运行结果：

```bash
PS D:\owner\gulp-lesson\03> npx gulp build
[14:23:14] Using gulpfile D:\owner\gulp-lesson\03\gulpfile.js
[14:23:14] Starting 'build'...
[14:23:14] Starting 'clean'...
[14:23:14] Starting 'clean'...
执行清除动作
[14:23:14] Finished 'clean' after 1.77 ms
[14:23:14] Starting '<anonymous>'...
执行清除动作
[14:23:14] Finished 'clean' after 2.91 ms
[14:23:14] Starting '<anonymous>'...
css 编译
[14:23:14] Finished '<anonymous>' after 2.28 ms
js编译
[14:23:14] Finished '<anonymous>' after 1.59 ms
[14:23:14] Finished 'build' after 7.63 ms
```

上面的运行日志， 执行了2次 clean 函数， 实际我们可能只希望执行一次。

例如， 我们编译css,或者编译 js， 之前一般是会清理 dist目录， 但是删除2次，会导致一些问题， 第一次dist目录存在， 再次删除，需要判断 dist 目录是否为空；

第二种是， 编译css 和 编译js ，是互不干涉的，所以使用的  并行 `parallel` , 如果css 编译快，则先产生 dist产物， js再编译，又执行了  clean 删除动作， 那么css的产物就丢失了

解决：

```javascript
import gulp from 'gulp'

const { series, parallel } = gulp

const clean = function (cb) {
  console.log('执行清除动作');
  // body omitted
  cb();
};

const css = (cb) => {
  console.log('css 编译');
  cb();
}

const javascript = (cb) => {
  console.log('javascript 编译');
  cb();
}

export const build = series(clean, parallel(css, javascript))
```

调整以后，以串行的方式，先执行 clean, 再并行执行 css, js打包任务， 此时 clean 任务只执行一次


```bash
npx gulp build
```

日志：

```bash
PS D:\owner\gulp-lesson\03> npx gulp build
[14:32:43] Using gulpfile D:\owner\gulp-lesson\03\gulpfile.js
[14:32:43] Starting 'build'...
[14:32:43] Starting 'clean'...
执行清除动作
[14:32:43] Finished 'clean' after 785 μs
[14:32:43] Starting 'css'...
[14:32:43] Starting 'javascript'...
css 编译
[14:32:43] Finished 'css' after 1.02 ms
javascript 编译
[14:32:43] Finished 'javascript' after 992 μs
[14:32:43] Finished 'build' after 4.42 ms
```

### 问题

#### 1、无法直接使用ES6 解构导入series，parallel 等

```bash
import { series, parallel } from 'gulp'
                 ^^^^^^^^
SyntaxError: Named export 'parallel' not found. The requested module 'gulp' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from 'gulp';
const { series, parallel } = pkg;
```

改为：

```javascript
import gulp from 'gulp'

const { series, parallel } = gulp
```

说明 gulp 并没有提供 `export const series` 的单独导出
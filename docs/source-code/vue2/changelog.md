# vue2相关的变动日志

### 2.7.14 (2022-11-09)

* compiler-sfc：修复模板使用情况检查 V 槽解构默认值的边缘情况
* provide/inject：合并期间不要改变原始提供选项
* reactivity: 避免使用弱图兼容IE
* types: 修复在 tsx 中传播 VNodeData
* types : EventHandlers 更严格类型条件

### 2.7.13 (2022-10-14)

* effectScope: 调用 off() 不应破坏当前作用域
* types: 样式属性 SVG
* watch: 避免遍历标记为非反应性的对象

### 2.7.12 (2022-10-12)

* fix:  setup hook 应该在 beforeCreated之前调用

### 2.7.11 (2022-10-11)

* build：在构建文件中强制执行 LF 行结尾
* compiler-sfc： 导出 parseComponent 以兼容 fork-ts-checker-webpack-plugin
* reactivity： 创建观察器时检查 ref   之前先检查跳过
* setup： setup hook 应该在 beforeCreated之前调用
* sfc： 修剪非 TS 返回的绑定
* sfc： 删除 SFC 范围的深层语法弃用警告
* types： 修复watch 的错误选项
* types：支持 tsx ref 属性中的 Ref 和函数类型
* types： VUE 3 指令类型兼容性

#### 性能提升
* 改进具有大量订阅的 deps 的 unsub 性能

### 2.7.10

### 2.7.9

### 2.7.8

### 2.7.6

### 2.7.5

### 2.7.4

### 2.7.3

### 2.7.2

### 2.7.1

### 2.7.0-N个预览版

### 2.6.14

### 2.6.8

### 2.6.7

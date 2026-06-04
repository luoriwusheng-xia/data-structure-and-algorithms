# stream - 流

在 Node.js 中处理大文件时，核心原则是：

**不要一次性把整个文件读到内存，而是使用 Stream 边读边写。**

****

```javascript
const data = fs.readFileSync('10GB.log')
```

**10GB 文件直接把 Node 进程干爆。**



大文件， 使用文件流进行操作

## 1. 最简单的 Stream 拷贝
```javascript
import fs from 'node:fs'

const readStream = fs.createReadStream('./package.json')

const writeStream = fs.createWriteStream('test.md')

readStream.pipe(writeStream)
```

 执行流程：

```javascript
磁盘
 ↓
ReadStream
 ↓
pipe
 ↓
WriteStream
 ↓
磁盘
```

 内存始终维持在几十 KB ~ 几 MB。

## 2. pipe 的本质
其实相当于：

```javascript
import fs from 'node:fs'

const readStream = fs.createReadStream('./package.json')

const writeStream = fs.createWriteStream('test.md')

readStream.on('data', (chunk) => {
  // chunk为  Buffer
  // console.log(chunk);
  // console.log(chunk.byteLength);

  writeStream.write(chunk)
})

readStream.on('end', () => {
  writeStream.end()
})
```

## 3. 处理背压（Backpressure）
面试经常问。

假设：

```plain
读速度：100MB/s
写速度：20MB/s
```

如果一直按照上面的方式

```javascript
readStream.on('data', chunk => {
  writeStream.write(chunk)
})
```

 内存会越来越大。

解决办法

```javascript

const canWrite = writeStream.write(chunk)

if (!canWrite) {
  readStream.pause()
}
```

当缓冲区满了：

```plain
write() => false
```

暂停读取。

等待：

```plain
writeStream.on('drain', () => {
  readStream.resume()
})
```

恢复读取。

完整实现：

```javascript
readStream.on('data', chunk => {
  const canWrite = writeStream.write(chunk)

  if (!canWrite) {
    readStream.pause()
  }
})

writeStream.on('drain', () => {
  readStream.resume()
})
```

##  4. Node 官方推荐
```javascript
const fs = require('fs')
const { pipeline } = require('stream')

pipeline(
  fs.createReadStream('big.zip'),
  fs.createWriteStream('copy.zip'),
  err => {
    if (err) {
      console.error(err)
    } else {
      console.log('完成')
    }
  }
)
```



 或者 Promise 版本：

```javascript
const fs = require('fs')
const { pipeline } = require('stream/promises')

await pipeline(
  fs.createReadStream('big.zip'),
  fs.createWriteStream('copy.zip')
)
```

优势：

+  自动关闭流
+  自动处理错误
+  自动处理 backpressure

生产环境推荐。



## 5. 一边读一边处理
例如统计日志行数。

```javascript
const fs = require('fs')

const rs = fs.createReadStream('access.log')

let count = 0

rs.on('data', chunk => {
  count += chunk
    .toString()
    .split('\n')
    .length - 1
})

rs.on('end', () => {
  console.log(count)
})
```

## 6. Transform 流
边读边转换。

例如全部转大写。

```javascript
const fs = require('fs')
const { Transform } = require('stream')

const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(
      null,
      chunk.toString().toUpperCase()
    )
  }
})

fs.createReadStream('input.txt')
  .pipe(upper)
  .pipe(fs.createWriteStream('output.txt'))
```

流程：

```plain
文件
 ↓
ReadStream
 ↓
Transform
 ↓
WriteStream
```

## 7. gzip 压缩大文件
实际项目常见。

```javascript
const fs = require('fs')
const zlib = require('zlib')

fs.createReadStream('huge.log')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('huge.log.gz'))
```

流程：

```plain
10GB log
 ↓
ReadStream
 ↓
gzip
 ↓
WriteStream
 ↓
1GB gzip
```

全程不会加载到内存。



 Node 使用 Stream 实现边读边写，不会一次性将文件加载到内存。常见做法是通过 `fs.createReadStream()` 和 `fs.createWriteStream()` 配合 `pipe()` 或 `pipeline()` 实现文件传输。底层通过 Buffer 分块读取，并利用 Backpressure 机制控制读写速度差异，避免内存暴涨。对于日志处理、文件上传下载、视频转码等场景，都会优先使用 Stream 而不是 `readFile`。这样即使处理 GB 甚至 TB 级文件，内存占用依然保持稳定。





## pipe 和pipeline 区别


 pipe 的问题

```javascript
a.zip
 ↓
ReadStream
 ↓
pipe
 ↓
WriteStream
 ↓
磁盘满了
```

写入时报错：

```javascript
ws.on('error', err => {
  console.log(err)
})
```

此时：

WriteStream 已挂
ReadStream 还在读



可能导致：

+  fd 未关闭
+  内存泄漏
+  文件句柄泄漏

你需要自己处理：

```javascript
rs.on('error', ...)
ws.on('error', ...)
```



场景2：

```javascript
fs.createReadStream('a.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('a.gz'))
```

如果：

```plain
a.txt 不存在
```

会发生什么？

---

读取流报错：

```plain
readStream.on('error')
```

但是：

```plain
gzip
writeStream
```

不一定自动关闭。

 所以你经常看到：

```javascript
readStream.on('error', handler)
writeStream.on('error', handler)
gzip.on('error', handler)
```

全部都要写。

非常烦。



### pipeline 出现的原因
Node 官方提供：

```javascript
const { pipeline } = require('stream')
```

```javascript
pipeline(
  fs.createReadStream('a.txt'),
  zlib.createGzip(),
  fs.createWriteStream('a.gz'),
  err => {
    if (err) {
      console.error(err)
    } else {
      console.log('完成')
    }
  }
)
```

流程：

```javascript
ReadStream
↓
Gzip
↓
WriteStream
```

和 pipe 一样。



```javascript
自动 pipe
+
自动错误传播
+
自动关闭流
+
自动销毁资源
```



### pipeline 自动处理错误
例如：

```plain
a.txt 不存在
```

---

只需要：

```plain
pipeline(..., err => {})
```

---

所有流都会：

```javascript
destroy()
close()
```

自动执行。

---

不需要：

```javascript
read.on('error')
gzip.on('error')
write.on('error')
```

一个个监听。



 Promise 版本（推荐）

```javascript
try {
  await pipeline(
    fs.createReadStream(src),
    fs.createWriteStream(dest)
  )

  console.log('成功')
} catch (err) {
  console.error(err)
}
```

| 特性 | pipe | pipeline |
| --- | --- | --- |
| 数据传输 | ✅ | ✅ |
| Backpressure | ✅ | ✅ |
| 自动错误传播 | ❌ | ✅ |
| 自动关闭流 | ❌ | ✅ |
| 多流管理 | 一般 | 很好 |
| Promise 支持 | ❌ | ✅ |
| 生产环境推荐 | 一般 | ✅ |


### 面试回答：
`pipe()` 用于连接 Readable Stream 和 Writable Stream，能够自动处理数据传输和 Backpressure，但不会帮我们统一处理整个流链路的错误。

`pipeline()` 是 Node 官方推荐的更安全方案，本质上也是基于 `pipe()` 实现的，但它会自动监听所有流的错误，并在出现异常时统一销毁整个流链路，避免资源泄漏。同时支持回调和 Promise 形式，更适合生产环境。

因此简单场景可以用 `pipe()`，而涉及文件处理、压缩、上传下载等生产代码时，通常优先使用 `pipeline()`。



实际上很多大厂面试官会继续追问：

**既然 pipeline 已经有了，为什么 pipe 还没被淘汰？**

答案是：

+ `pipe()` 更轻量
+  浏览器 Stream API 也有类似设计
+  很多第三方库仍然基于 `pipe`
+ `pipeline()` 内部本身也是建立在 `pipe()` 之上的

所以：

```plain
pipe = 基础能力
pipeline = 工程化封装
```

这个理解是最准确的。



###  为什么需要 Backpressure？
流的读速度大于写的速度，  Node Stream 要解决的核心问题：**Backpressure（背压）**。



```javascript
const rs = fs.createReadStream('10GB.mp4')
const ws = fs.createWriteStream('copy.mp4')

rs.pipe(ws)
```

看起来很简单：

```plain
ReadStream  ---> WriteStream
```

但实际上：

```plain
磁盘读取速度
      >
磁盘写入速度
```

经常发生。

#### 场景1： SSD → 网络
例如：

```plain
NVMe SSD
读取 7000MB/s

上传到服务器
带宽 10MB/s
```

此时：

```plain
生产速度 7000MB/s
消费速度   10MB/s
```

差了 700 倍。

如果没有背压：

```plain
Buffer
Buffer
Buffer
Buffer
Buffer
...
```

内存会越来越大。

最终：

```plain
OOM  内存溢出
```

#### 场景2：文件读取 → gzip压缩
```javascript
fs.createReadStream('big.log')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('big.log.gz'))
```

这里可能：

```plain
读取速度
1000MB/s

gzip压缩
100MB/s
```

压缩跟不上。



##


#### 场景3：数据库写入
```javascript
stream.on('data', async row => {
  await db.insert(row)
})
```

数据库：

```plain
每秒写1000条
```

文件：

```plain
每秒读100000条
```

明显跟不上。



#### Node 是怎么发现写不动的
关键就在：

```javascript
writeStream.write(chunk)
```

返回值。

---

正常情况：

```javascript
const ok = ws.write(chunk)

console.log(ok)

// 输出
// true  继续写  我还能吃得下
```



当内部缓冲区满了：

```plain
false
```

表示：

```plain
停！
我来不及处理了
```

---

#### 例子
```javascript
rs.on('data', chunk => {
  const canWrite = ws.write(chunk)

  if (!canWrite) {
    rs.pause()
  }
})

ws.on('drain', () => {
  rs.resume()
})
```

流程：

```plain
ReadStream
    ↓
write()

返回true
    ↓
继续读

返回false
    ↓
pause()

等待drain
    ↓
resume()
```

Stream 中生产者和消费者速度通常不一致。

 读取文件、网络接收数据往往比写入磁盘、数据库或业务处理更快。如果没有背压机制，数据会不断堆积在内存中，导致内存暴涨甚至 OOM。

 Node 通过 `write()` 返回值、`pause()` / `resume()` 和 `drain` 事件实现背压控制，而 `pipe()` 已经帮我们自动处理了这些逻辑。





## highWaterMark 是不是每次读取的大小？
`highWaterMark` 的本质是：

内部缓冲区（Buffer Queue）的水位线阈值，不是严格意义上的每次读取大小。



不是。 highWaterMark 表示 Stream 内部缓冲区的目标水位线或阈值，用于控制预读取和背压。对于 fs.createReadStream 来说，chunk 大小经常接近 highWaterMark，所以容易误认为它是每次读取大小。但在网络流、Socket 流等场景下，chunk 的实际大小是不固定的，highWaterMark 更多是控制内部缓存容量，而不是规定每次必须读取多少字节。

****

#### 从 Buffer 角度理解
Node 内部维护一个缓冲区队列：

```javascript
Readable Stream

┌─────────────────────┐
│ Internal Buffer     │
└─────────────────────┘
```

**假设：**

```javascript
highWaterMark = 64KB
```

**意思是：**

```javascript
缓冲区数据量
< 64KB

继续读
```

```javascript
缓冲区数据量
>= 64KB

暂停预读取
```

**它控制的是：**

```javascript
缓冲区允许积压多少数据
```

**而不是：**

```javascript
每次系统调用 read() 必须读多少
```



****

## Buffer和 Stream 有什么区别
 一句话概括：

**Buffer 是数据本身，Stream 是处理数据的方式。**

可以理解为：

+  Buffer = 一桶水
+  Stream = 水管

### Buffer 是什么
Buffer 是 Node.js 提供的二进制数据容器。



本质上：

```javascript
const buf = Buffer.from('hello')

console.log(buf)
```

输出：

```javascript
<Buffer 68 65 6c 6c 6f>
```

内存中：

```javascript
Buffer
┌────┬────┬────┬────┬────┐
│68  │65  │6c  │6c  │6f  │
└────┴────┴────┴────┴────┘
```

Buffer 代表：

```javascript
一整块数据
```

例如：

```javascript
fs.readFile('1GB.zip', (err, data) => {
  console.log(data)
})
```

这里：

```javascript
data instanceof Buffer
```

成立。

意味着：

```plain
先把整个文件读到内存
再返回 Buffer
```

### Stream 是什么
Stream 是流。

特点：

```javascript
边读边处理
边写边输出
```

例如：

```javascript
const stream = fs.createReadStream('1GB.zip')
```

读取过程：

```javascript
文件
↓
64KB
↓
64KB
↓
64KB
↓
64KB
```

不会一次性读完。



### Buffer 和 Stream 的核心区别
假设：

```plain
文件大小 = 1GB
```

**Buffer**

```plain
const data = await fs.promises.readFile('1GB.zip')
```

过程：

```plain
读取 1GB
↓
存入内存
↓
返回 Buffer
```

内存：

```plain
≈ 1GB
```

Stream

```plain
const stream = fs.createReadStream('1GB.zip')
```

过程：

```plain
64KB
处理
释放

64KB
处理
释放

64KB
处理
释放
```

内存：

```plain
几十 KB
```

即可完成。



### Stream 内部其实也是 Buffer
很多人误解：

```plain
Buffer 和 Stream 是竞争关系
```

实际上：

```plain
Stream 底层也是 Buffer
```

 Buffer 是 Node.js 中存储二进制数据的一块内存区域，通常表示完整的数据；而 Stream 是一种数据处理机制，它把数据拆成多个 chunk（底层通常是 Buffer）进行传输和处理。Buffer 适合小文件一次性读取，Stream 适合大文件和网络传输场景，可以边读边处理，显著降低内存占用。



 Stream 的核心价值不只是节省内存，更重要的是支持背压（Backpressure）机制，保证生产速度和消费速度平衡，这也是 Node.js 高性能 I/O 的基础之一。


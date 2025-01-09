/**
 * node 下载第三方平台的图片，并写入本地； 再使用 scripts/to-webp.js脚本将图片转码
 */

import fs from 'fs'
import path from 'path'

let url = [
  "https://s.poetries.top/gitee/2021/01/15.png",
  "https://s.poetries.top/gitee/2021/01/16.png",
  "https://s.poetries.top/gitee/20190922/vue.jpeg",
  "https://s.poetries.top/images/20210408091523.png",
  "https://s.poetries.top/images/20210328214834.png",
  "https://s.poetries.top/images/20210328112610.png",
  "https://s.poetries.top/images/20210408093135.png",
  "https://s.poetries.top/images/20210407162653.png",
  "https://s.poetries.top/images/20210504211204.png"
]

let temp = './temp-image'

// 检查temp目录是否存在，不存在则创建一个
if (!fs.existsSync(temp)) {

  // 创建目录
  fs.mkdirSync(temp)
  console.log('创建目录成功');
}

url.forEach(async (item) => {
  let filename = item.split('/').pop()

  try {
    let r1 = await fetch(item)

    let r2 = await r1.arrayBuffer()

    fs.writeFileSync(path.resolve(temp, filename), Buffer.from(r2))

  } catch (error) {
    console.log('报错了');
    console.log(error);
  }
})

console.log('图片全部-下载完成')

/**
 * node 下载第三方平台的图片，并写入本地； 再使用 scripts/to-webp.js脚本将图片转码
 */

import fs from 'fs'
import path from 'path'

let allList = [
  "http://localhost:8080/docs/interview/improve/image.webp",
  "http://localhost:8080/docs/interview/improve/image-1.png",
  "http://localhost:8080/docs/interview/improve/image-2.png",
  "http://localhost:8080/docs/interview/improve/image-3.png",
  "http://localhost:8080/docs/interview/improve/image-4.png",
  "http://localhost:8080/docs/interview/improve/image-5.png",
  "https://s.poetries.top/images/20210414160103.png",
  "https://s.poetries.top/images/20210406200721.png",
  "https://s.poetries.top/images/20210406200756.png",
  "https://s.poetries.top/images/20210406200826.png",
  "https://s.poetries.top/images/20210414151626.png",
  "https://s.poetries.top/gitee/2020/09/112.png",
  "https://s.poetries.top/gitee/2020/09/105.png",
  "https://s.poetries.top/images/20210414142754.png",
  "https://s.poetries.top/images/20210309103243.png",
  "https://s.poetries.top/images/20210309103312.png",
  "https://s.poetries.top/images/20210309103358.png",
  "https://s.poetries.top/gitee/2019/10/319.png",
  "https://s.poetries.top/gitee/2019/10/320.png",
  "https://s.poetries.top/images/20210407141323.png",
  "https://s.poetries.top/images/20210414175500.png",
  "https://s.poetries.top/images/20210414210720.png",
  "https://s.poetries.top/images/20210408100806.png",
  "https://s.poetries.top/images/20210414210917.png",
  "https://s.poetries.top/images/20210516161332.png",
  "https://s.poetries.top/images/20210516162034.png",
  "https://s.poetries.top/images/20210516162330.png",
  "https://s.poetries.top/images/20210516162704.png",
  "https://s.poetries.top/images/20210516163038.png",
  "https://s.poetries.top/images/20210516163647.png",
  "https://s.poetries.top/gitee/2020/09/10.png",
  "https://s.poetries.top/gitee/2020/07/fe/4.png",
  "https://s.poetries.top/images/20210516165328.png",
  "https://s.poetries.top/images/20210414213126.png",
  "https://s.poetries.top/images/20210414211816.png",
  "https://s.poetries.top/images/20210414211850.png",
  "https://s.poetries.top/images/20210516214402.png",
  "https://s.poetries.top/images/20210516221825.png",
  "https://s.poetries.top/images/20210414212124.png",
  "https://s.poetries.top/images/20210424174311.png",
  "https://s.poetries.top/images/20210516224232.png",
  "https://s.poetries.top/images/20210414213602.png",
  "https://s.poetries.top/images/20210529172258.png",
  "https://s.poetries.top/gitee/2020/07/fe/5.png",
  "https://s.poetries.top/images/20210414212916.png",
  "https://s.poetries.top/images/20210414142630.png",
  "https://s.poetries.top/images/20210414134752.png",
  "https://s.poetries.top/images/20210414141731.png",
  "https://s.poetries.top/uploads/2022/08/f636f4c6e3cfbd36.png",
  "https://s.poetries.top/gitee/2020/09/9.png",
  "https://s.poetries.top/images/20210414163215.png",
  "https://s.poetries.top/gitee/2020/09/7.png",
  "https://s.poetries.top/gitee/2020/09/8.png",
  "https://s.poetries.top/images/20210414164546.png",
  "https://s.poetries.top/images/20210414164425.png",
  "https://s.poetries.top/images/20210414164820.png",
  "https://s.poetries.top/images/20210414164939.png",
  "https://s.poetries.top/images/20210414165705.png",
  "https://s.poetries.top/images/20210414170410.png",
  "https://s.poetries.top/images/20210414170438.png",
  "https://s.poetries.top/images/20210414170747.png",
  "https://s.poetries.top/images/20210414171508.png"
]

console.log(`总个数 【${allList.length}】`)

let temp = './temp-image'

// 检查temp目录是否存在，不存在则创建一个
if (!fs.existsSync(temp)) {

  // 创建目录
  fs.mkdirSync(temp)
  console.log('创建目录成功');
}


let finishCount = 0

let t1 = performance.now()

let task = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      let filename = url.split('/').pop()
      let r1 = await fetch(url)

      let r2 = await r1.arrayBuffer()

      fs.writeFileSync(path.resolve(temp, filename), Buffer.from(r2))

      finishCount++

      console.log(`进度 ${finishCount} / ${allList.length}`);

      resolve()
    } catch (err) {
      console.log('失败的url');
      reject({
        url,
        error
      })
    }
  })
}

let genAllTask = allList.map(url => task(url))

async function run () {
  try {
    let result =  await Promise.allSettled(genAllTask)
    console.log('图片全部-下载完成')

    console.log(result);

  } catch (error) {
    console.log('下载报错了');

    console.log(error);
  }

  console.log(`总耗时 【${(performance.now() - t1) / 1000}s】`);
}

run()


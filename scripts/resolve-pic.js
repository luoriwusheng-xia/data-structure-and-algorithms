import markdownit from 'markdown-it'
import fs from 'node:fs'
import path from 'node:path'

import axios from 'axios'
import { Blob } from 'node:buffer'

let htmlText = fs.readFileSync('./01.md', 'utf-8')
// console.log(htmlText);

const md = new markdownit()
/**
 * ![](https://s.poetries.work/gitee/2020/07/79.png){.lazy
data-src="https://s.poetries.work/gitee/2020/07/79.png" loading="lazy"}
 */

const mdNodes = md.parse(htmlText)

//

// 遍历节点

const findImgNode = () => {

}

let picList = []

mdNodes.forEach((item, index) => {
  // 图片
  if (item.type === 'inline' && item.children) {
    // 子节点里面也有N个图片的情况

    let children = item.children

    children.forEach(p => {
      if (p.tag === 'img' && p.type === 'image') {
        picList.push(p)
      }

    })
  }

  if (item.type === 'inline' && item.tag === 'img' && item.type === 'image') {
    picList.push(item)
  }

})

const getImageSrcList = (list) => {
  let result = []
  list.forEach(p => {
    let src = p.attrs[0][1]
    result.push(src)
  })

  return result
}

/**
 * @param {String} url
 * @param {Number} i
 */
let fetchSource = async (url, i) => {
  try {
    let res = await axios(url, {
      responseType: 'stream'
    })

    let pos = url.lastIndexOf('.')
    let type = url.substring(pos + 1)

    let index = String(i).padStart(2, '0')

    await res.data.pipe(fs.createWriteStream(`./test/${index}.${type}`))

    return true
  } catch (error) {
    console.log('请求失败');
    console.log(error);
    return false
  }
}


let f2 = async (url, i) => {
  try {

    let res = await fetch(url)

    let buffer = await res.arrayBuffer()

    // 转成blob 拿到图片的后缀 - 这里是拿不到图片的文件类型的
    // let blob = new Blob([buffer])
    // 将文件写入到目标
    await fs.promises.writeFile('./02.png', Buffer.from(buffer))
  } catch (error) {
    console.log(error);
  }
}


/**
 * 先生成 blob， 在转arrayBuffer, 再写入文件
 */
let f3 = async (url, i) => {
  try {
    let res = await fetch(url)

    let blob = await res.blob()

    let arrayBuffer = await blob.arrayBuffer()

    await fs.promises.writeFile('./test/4.png', Buffer.from(arrayBuffer))

  } catch (error) {
    console.log(error);
  }
}


// 定义一个计数器，用于记录已完成的请求数量
let completedRequests = 0;

let checkFetchFinish = () => {
  completedRequests++

  if (completedRequests === requests.length) {
    console.log('完成');

    // 将数据还原
  }
}

let requests = []

const imagToFile = async (list, outDir) => {

  // 并发请求
  list.forEach((url, i) => {
    requests.push(
      fetchSource.bind(null, url, i + 1)
    )
  })

  requests.forEach(async (item, index) => {
    try {
      await item()
    } catch (error) {
      console.log('有一个报错');
    } finally {
      console.log('当前', index);
      // 不管请求成功还是失败，都要执行检查，因为失败也属于一种状态的变更
      checkFetchFinish()
    }
  })

  // 同步请求

  // return new Promise(async (resolve, reject) => {
  //   let count = 0

  //   for (let i = 0; i < list.length; i++) {
  //     let flag = await fetchSource(list[i], i)

  //     if (flag) {
  //       count ++
  //     }

  //     if (count === list.length) {
  //       resolve()
  //     }
  //     console.log('执行', i, '当前count', count);
  //   }
  // })

}

const srcList = getImageSrcList(picList)


imagToFile(srcList, 'test')
.then(() => {
  console.log('完成了');
})


// console.log(mdNodes);
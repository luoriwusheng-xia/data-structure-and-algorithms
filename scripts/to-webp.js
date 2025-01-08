/**
 * 将项目中的图片转为webp格式
 */

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

let projectBase = './'

let targetPath = 'docs/interview/improve'

let parentPath = path.resolve(projectBase, targetPath)


let files = fs.readdirSync(path.resolve(projectBase, targetPath))

let imageFiles = files.filter(item => item.endsWith('.png') || item.endsWith('.jpg') || item.endsWith('.jpeg'))

let list = imageFiles.map(item => {
  let name = path.parse(item).name

  let rename = name + '.webp'

  let inputPath = path.resolve(parentPath, item)

  let outputPath = path.resolve(parentPath, rename)

  return {
    inputPath,
    outputPath
  }
})

async function run () {

  try {
    let tasks = list.map((k) => convertToWebp(k.inputPath, k.outputPath, 80))

    let result = await Promise.allSettled(tasks)

    console.log('全部转换完成');
    // console.log(result);

    // 删除源文件
    list.forEach(k => {
      deleteFile(k.inputPath)
    })

  } catch (error) {
    console.log('报错了');
    console.log(error);

  }
}

run()


/**
 * 将图片转换为 WebP 格式
 * @param {string} inputPath 输入图片路径
 * @param {string} outputPath 输出 WebP 路径
 * @param {number} quality 质量（0-100）
 * @returns {Promise<void>}
 */
function convertToWebp (inputPath, outputPath, quality = 80) {
  return new Promise((resolve, reject) => {
    // 构造 cwebp 命令
    const command = `cwebp -q ${quality} "${inputPath}" -o "${outputPath}"`;

    // 执行命令
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      // 会输出 cwebp 转换的过程数据，非错误信息，需要注意甄别
      if (stderr) {
        // console.log(stderr);
      }

      resolve();
    });
  });
}


function deleteFile (filePath) {
  try {
     fs.unlinkSync(filePath)
  } catch (error) {

  }
}

// 再到 对应的markdown 中，使用正则替换一下
/**
 * (\(image.*?)(\.png)
 * 替换为
 * $1.webp
 *
 */
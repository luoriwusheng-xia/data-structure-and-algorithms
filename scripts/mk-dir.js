/**
 * 批量生成文件的，请勿执行
 */
import fs from 'fs'

let basePath = './docs/interview/principle/react/'

for(let i =1 ; i<28; i++) {
  let a = String(i).padStart(2, '0')

  console.log(basePath+a + '.md');
  fs.writeFile(basePath+a + '.md', '', () => {})
}
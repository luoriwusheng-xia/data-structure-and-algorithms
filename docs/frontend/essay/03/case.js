// 上一次获取到的script的地址
let lastSrcs = []

const scriptReg = /\<script.*src=["'](?<src>[^"']+)/gm

/**
 * 获取网页最新的scripts链接
 */
async function extractNewScripts () {
  // 增加时间戳，避免缓存
  const html = await fetch('/?t=' + Date.now())
    .then(res => res.text())

  scriptReg.lastIndex = 0

  let result = []
  let match

  while (scriptReg.exec(html)) {
    match = scriptReg.exec(html)
    result.push(match.goups.src)
  }

  return result
}

/**
 * 判断是否需要刷新
 * @returns
 */
async function needUpdate () {
  const newScripts = await extractNewScripts()

  // 第一次资源下发给客户端浏览器
  if (!lastSrcs) {
    lastSrcs = newScripts
    return false
  }

  // 第二次以后
  // 如果静态资源个数发生了变化，则一定是有静态资源更新了
  let result = false
  if (lastSrcs.length !== newScripts.length) {
    result = true
  }

  // 假设上面静态资源个事一致，则挨个比较静态资源的值， 如果值发生变化，则静态资源一定是更新了（hash变了）
  for (let i = 0; i < lastSrcs.length; i++) {
    if (lastSrcs[i] !== newScripts[i]) {
      result = true
      break
    }
  }

  lastSrcs = newScripts

  return result
}

function autoRefresh () {
  setTimeout(async () => {
    const willUpdate = await needUpdate()

    if (willUpdate) {
      const result = confirm('页面有更新，点击确定刷新页面')

      if (result) {
        location.reload()
      }
    }
  }, 2000);
}

/**
 * 在main.js中直接引入即可
 */
autoRefresh()
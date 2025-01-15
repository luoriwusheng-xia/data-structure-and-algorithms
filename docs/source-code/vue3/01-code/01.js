// @ts-check

// Using esbuild for faster dev builds.
// We are still using Rollup for production builds because it generates
// smaller files and provides better tree-shaking.

// 使用 esbuild 作为开发环境的构建工具
import esbuild from 'esbuild'
import fs from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { parseArgs } from 'node:util'
// 主要用于在浏览器环境中模拟 Node.js 的内置模块
import { polyfillNode } from 'esbuild-plugin-polyfill-node'

// 创建 require 函数用于 ESM 环境中加载 CommonJS 模块
const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

// 解析命令行参数：

//  pnpm run dev  脚本中，没有传递任何参数，所以是默认参数

const {
  values: { format: rawFormat, prod, inline: inlineDeps },
  positionals,
} = parseArgs({
  allowPositionals: true,
  options: {
    // 输出格式（默认为 'global'）
    format: {
      type: 'string',
      short: 'f',
      default: 'global',
    },
    //  是否为生产构建
    prod: {
      type: 'boolean',
      short: 'p',
      default: false,
    },
    // 是否内联依赖
    inline: {
      type: 'boolean',
      short: 'i',
      default: false,
    },
  },
})

// 开发环境： rawFormat --就是 global

const format = rawFormat || 'global'
// 开发环境： positionals 是 [] 数组
const targets = positionals.length ? positionals : ['vue']

// 开发环境输出的 产物格式就是 (function() { .... })() 自执行函数
// resolve output
const outputFormat = format.startsWith('global')
  ? 'iife'
  : format === 'cjs'
    ? 'cjs'
    : 'esm'

    // 开发环境： postfix - 就是 global
const postfix = format.endsWith('-runtime')
  ? `runtime.${format.replace(/-runtime$/, '')}`
  : format

const privatePackages = fs.readdirSync('packages-private')

// 开发环境这里的 targets 就是 [ 'vue' ]
for (const target of targets) {
  const pkgBase = privatePackages.includes(target)
    ? `packages-private`
    : `packages`

  // 这里拿到的就是 pkgBase： packages 目录

  // 当前执行目录在 scripts. 去到同级目录 /packages/vue
  const pkgBasePath = `../${pkgBase}/${target}`

  // 拿到 /packages/vue/package.json 文件， 这里是通过 require拿到文件内容的 ， 本质就是一个 json类型，对象
  const pkg = require(`${pkgBasePath}/package.json`)

  // 输出目录： 还是输出到 /packages/vue/dist/vue.global.js
  const outfile = resolve(
    __dirname,
    `${pkgBasePath}/dist/${
      target === 'vue-compat' ? `vue` : target
    }.${postfix}.${prod ? `prod.` : ``}js`,
  )
  const relativeOutfile = relative(process.cwd(), outfile)

  // 开发环境： inlineDeps 为false
  // resolve externals
  // TODO this logic is largely duplicated from rollup.config.js
  /** @type {string[]} */
  let external = []

  // 执行dev 下面的 2个if 都是 false 跳过的， 只打包了 vue
  if (!inlineDeps) {
    // 外部依赖处理，  确定哪些依赖应该被视为外部依赖
    // cjs & esm-bundler: external all deps
    if (format === 'cjs' || format.includes('esm-bundler')) {
      external = [
        ...external,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        // for @vue/compiler-sfc / server-renderer
        'path',
        'url',
        'stream',
      ]
    }

    if (target === 'compiler-sfc') {
      const consolidatePkgPath = require.resolve(
        '@vue/consolidate/package.json',
        {
          paths: [resolve(__dirname, `../packages/${target}/`)],
        },
      )
      const consolidateDeps = Object.keys(
        require(consolidatePkgPath).devDependencies,
      )
      external = [
        ...external,
        ...consolidateDeps,
        'fs',
        'vm',
        'crypto',
        'react-dom/server',
        'teacup/lib/express',
        'arc-templates/dist/es5',
        'then-pug',
        'then-jade',
      ]
    }
  }
  /** @type {Array<import('esbuild').Plugin>} */
  const plugins = [
    {
      name: 'log-rebuild',
      setup(build) {
        build.onEnd(() => {
          console.log(`built: ${relativeOutfile}`)
        })
      },
    },
  ]

  if (format !== 'cjs' && pkg.buildOptions?.enableNonBrowserBranches) {
    plugins.push(polyfillNode())
  }

  // 开始打包
  esbuild
    .context({
      entryPoints: [resolve(__dirname, `${pkgBasePath}/src/index.ts`)],
      outfile,
      bundle: true, // 将所有的依赖打包到一个文件，比如 vue中依赖了 @vue/shared 就打包到一起
      external,
      sourcemap: true, // 开发环境： sourcemap 是 true
      format: outputFormat,

      // 这里取的就是 pakcages/vue/package.json 中定义的 buildOptions 对象
      globalName: pkg.buildOptions?.name,
      platform: format === 'cjs' ? 'node' : 'browser', // dev环境 默认就是 browser环境
      plugins,
      // 开发环境： 定义一些全局变量，用于条件编译：
      define: {
        __COMMIT__: `"dev"`,
        __VERSION__: `"${pkg.version}"`,
        // 是否为开发环境， 在特定环境打包的时候，有的代码会自动跳过并删除，tree shaking掉
        __DEV__: prod ? `false` : `true`,
        __TEST__: `false`,
        __BROWSER__: String(
          format !== 'cjs' && !pkg.buildOptions?.enableNonBrowserBranches,
        ),
        __GLOBAL__: String(format === 'global'),
        __ESM_BUNDLER__: String(format.includes('esm-bundler')),
        __ESM_BROWSER__: String(format.includes('esm-browser')),
        __CJS__: String(format === 'cjs'),
        __SSR__: String(format !== 'global'),
        __COMPAT__: String(target === 'vue-compat'),
        __FEATURE_SUSPENSE__: `true`,
        __FEATURE_OPTIONS_API__: `true`,
        __FEATURE_PROD_DEVTOOLS__: `false`,
        __FEATURE_PROD_HYDRATION_MISMATCH_DETAILS__: `true`,
      },
    })
    .then(ctx => ctx.watch()) // 启动了文件监听模式
}

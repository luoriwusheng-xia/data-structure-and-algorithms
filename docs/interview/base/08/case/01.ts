// vue2.7.16 源码

/* globals MutationObserver */
// 是为了告诉编译器 MutationObserver 是全局变量，避免在代码检查工具中出现未定义的错误。

// noop 是一个空函数，可能用于占位或作为默认函数调用，当不需要执行实际操作时使用。
import { noop } from 'shared/util';
import { handleError } from './error';
import { isIE, isIOS, isNative } from './env';

//  用于标记是否使用微任务，初始化为 false。
export let isUsingMicroTask = false;

// callbacks 是一个存储回调函数的数组，这些回调函数将在适当的时候被调用。
const callbacks: Array<Function> = [];

// 是一个标志位，用于表示是否已经有异步任务在等待执行，初始化为 false
let pending = false;

// flushCallbacks 函数的作用是执行存储在 callbacks 数组中的所有回调函数，并将 pending 标志重置为 false。
function flushCallbacks() {
  // 首先将 pending 置为 false，表示当前没有等待执行的异步任务。
  pending = false;

  //  复制 callbacks 数组，因为在执行回调函数时，可能会有新的回调函数添加到 callbacks 中，避免执行期间出现问题。
  const copies = callbacks.slice(0);

  // 清空 callbacks 数组。
  callbacks.length = 0;

  // 依次执行其中的回调函数。
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
// 定义 timerFunc 函数，它将用于触发 flushCallbacks 的执行，具体实现将根据不同的环境选择不同的异步任务机制。
// 这段注释解释了使用微任务的原因，之前的版本使用过宏任务和微任务的组合，但会出现一些问题，例如状态在重绘前修改时的问题，以及在事件处理程序中使用宏任务会导致奇怪的行为，所以现在统一使用微任务。但使用微任务也有缺点，如在某些场景下微任务优先级过高，会在一些连续事件之间或同一事件的冒泡过程中触发。
let timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 首先检查 Promise 是否存在且是原生的

  const p = Promise.resolve();
  timerFunc = () => {
    // 将 flushCallbacks 作为微任务添加到微任务队列中。
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    // 在 iOS 环境中，为了避免 Promise.then 的一些问题，使用 setTimeout(noop) 来强制刷新微任务队列，noop 是空函数，这里只是为了触发浏览器的任务处理机制。
    if (isIOS) setTimeout(noop);
  };

  // 将 isUsingMicroTask 标记为 true，表示使用微任务。
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  // 如果不满足 Promise 的条件，并且不是 IE 且 MutationObserver 存在，并且是原生或满足一些特定条件
  // 比较新的浏览器， MutationObserver.toString() 是返回这个字符串'function MutationObserver() { [native code] }'

  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4  适配低端机型
  // (#6466 MutationObserver is unreliable in IE11)  MutationObserver 在 IE 11 不可用
  let counter = 1;

  // 创建一个 MutationObserver 实例 observer 来观察文本节点 textNode 的字符数据变化。
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    // 仅 监听文本节点 textNode 的字符数据变化
    characterData: true,
  });

  // 一样的，定义这个全局函数
  timerFunc = () => {
    counter = (counter + 1) % 2;

    // 触发 textNode.data 的变化，触发 MutationObserver 的回调函数，从而触发 flushCallbacks 的执行。
    textNode.data = String(counter);
  };

  // 同样将 isUsingMicroTask 标记为 true，表示使用微任务。
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // 如果不满足前面的条件，但 setImmediate 存在且是原生的，使用 setImmediate 作为 timerFunc 的实现，将 flushCallbacks 作为宏任务添加到宏任务队列。
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // 作为最后的保底，如果前面的条件都不满足，使用 setTimeout(flushCallbacks, 0) 将 flushCallbacks 作为宏任务添加到宏任务队列，延迟为 0 毫秒，在下一个事件循环中执行。
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

// 这里仅仅是 ts 的类型声明； 这是 nextTick 函数的实现，支持不同的调用方式：
export function nextTick(): Promise<void>;
export function nextTick<T>(
  this: T,
  cb: (this: T, ...args: any[]) => any
): void;
export function nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void;

/**
 * 这里才是具体的实现
 * @internal
 */
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve;

  // 除了渲染watcher  还有用户自己手动调用的nextTick 一起被收集到数组

  callbacks.push(() => {
    if (cb) {
      try {
        // 可以传入一个回调函数 cb 和一个上下文 ctx，将回调函数包装在一个函数中添加到 callbacks 数组中，并使用 call 方法调用，同时使用 handleError 处理可能的错误。
        cb.call(ctx);
      } catch (e: any) {
        // 这里就保证了vue 统一的错误处理
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  // 如果 pending 为 false，表示没有正在等待执行的异步任务，调用 timerFunc 触发异步任务的执行。
  // 如果多次调用nextTick  只会执行一次异步 等异步队列清空之后再把标志变为false
  if (!pending) {
    pending = true;
    timerFunc();
  }

  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    // 可以不传回调函数，这种情况下会返回一个 Promise，通过 _resolve 来实现 Promise 的解析。
    // 例如： nextTick().then(() => {....其他业务上的逻辑})

    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}

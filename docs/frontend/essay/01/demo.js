
function isAsyncFunction (func) {
  // console.log(func)
  let str = Object.prototype.toString.call(func)

  console.log(str);
  // 方式1：
  // return str === '[object AsyncFunction]'

  // 方式2：
  return func[Symbol.toStringTag] === 'AsyncFunction'
}

let t1 = isAsyncFunction(() => { })  // false
let t2 = isAsyncFunction(async () => { }) // true

console.log(t1, t2);
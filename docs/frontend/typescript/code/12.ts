{
  // 定义一个工具类型 IsEqual，用于判断两个泛型参数是否一致
  type IsEqual<T, U> =
    (<G>() => G extends T ? 1 : 2) extends
    (<G>() => G extends U ? 1 : 2)
    ? true
    : false;

  // 示例使用
  type Result1 = IsEqual<string, string>; // true
  type Result2 = IsEqual<string, number>; // false

  type Test3 = IsEqual<{ a: number }, { a: number }>; // true
  type Test4 = IsEqual<{ a: number }, { a: string }>; // false

  let a1: Result1 = true
  // 如果将 a1赋值为false 则编译器报错
  // let a3:Result1 = false
  let a2: Result2 = false
}
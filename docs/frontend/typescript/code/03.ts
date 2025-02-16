interface Options {
  color?: string;
  size?: number;
}

type RequiredOptions = Required<Options>;
// 下面的代码会报错，因为所有属性现在都是必选的
// const reqOptions: RequiredOptions = { color: 'red' };
const reqOptions: RequiredOptions = { color: 'red', size: 10 };
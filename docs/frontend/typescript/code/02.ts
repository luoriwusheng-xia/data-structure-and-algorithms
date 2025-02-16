interface User {
  name: string;
  age: number;
  email: string;
}

type PartialUser = Partial<User>;
// 现在 PartialUser 的属性都是可选的
const partialUser: PartialUser = { name: 'John' };

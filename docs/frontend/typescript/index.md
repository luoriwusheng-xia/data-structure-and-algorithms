# typescript

### public

<<<./code/01.ts

在debugger 中， 执行到 constructor 的时候， 高亮部分会跳到 构造器上面， 其实表示的就是 this.name = name 初始化赋值的意思。


### ts的内置类型工具

1. `Partial<T>`

`Partial<T>` 用于创建一个新类型，该类型的所有属性都变为可选属性。这在处理可能只更新部分属性的场景中非常有用。

<<<./code/02.ts

2. `Required<T>`

与 `Partial<T>` 相反，`Required<T>` 会将类型 T 的所有可选属性转换为必选属性。

<<<./code/03.ts

3. `Readonly<T>`

`Readonly<T>` 会将类型 T 的所有属性设置为只读属性，意味着一旦对象被创建，就不能再修改其属性值。

<<<./code/04.ts


4. `Pick<T, K>`

`Pick<T, K>` 从类型 T 中选取一组属性 K 来构造一个新类型。

<<<./code/05.ts


5. `Omit<T, K>`

`Omit<T, K>` 与 `Pick<T, K>` 相反，它会从类型 T 中移除一组属性 K 来构造一个新类型。

<<<./code/06.ts

6. `Exclude<T, U>`

`Exclude<T, U>` 从类型 T 中排除那些可以赋值给类型 U 的类型，返回一个新类型。


<<<./code/07.ts


7. `Extract<T, U>`

`Extract<T, U>` 从类型 T 中提取那些可以赋值给类型 U 的类型，返回一个新类型。

<<<./code/08.ts

8. `NonNullable<T>`

`NonNullable<T>` 从类型 T 中排除 null 和 undefined 类型，返回一个新类型。


<<<./code/09.ts


9. `ReturnType<T>`

`ReturnType<T>` 用于获取函数类型 T 的返回值类型。


<<<./code/10.ts


10. `InstanceType<T>`

`InstanceType<T>` 用于获取构造函数类型 T 的实例类型。


<<<./code/11.ts

这些类型工具为 TypeScript 开发者提供了强大的类型操作能力，能够让代码更加灵活和安全。


### 判断2个泛型参数是否一致

写一个工具，接受2个入参，这2个入参都是泛型参数， 判断2个泛型参数是否一致

<<<./code/12.ts

IsEqual 工具类型：

这是一个泛型条件类型，接受两个泛型参数 T 和 U。
我们使用了两个函数类型来进行比较。`<G>() => G extends T ? 1 : 2` 是一个函数类型，它接受一个泛型参数 G，并根据 G 是否可以赋值给 T 来返回 1 或 2。

同样，`<G>() => G extends U ? 1 : 2` 是另一个函数类型，它根据 G 是否可以赋值给 U 来返回 1 或 2。
通过比较这两个函数类型，如果它们是相同的，说明 T 和 U 是一致的，此时返回 true；否则返回 false。

示例使用：
`type Result1 = IsEqual<string, string>`：这里传入的两个泛型参数都是 string，所以 Result1 的类型为 true。
`type Result2 = IsEqual<string, number>`：这里传入的两个泛型参数分别是 string 和 number，它们不相同，所以 Result2 的类型为 false。
通过这种方式，我们可以在类型层面判断两个泛型参数是否一致。


### type 和 interface 的区别

在 TypeScript 里，type 和 interface 都能用于定义类型

**语法和定义范围**

type：type 能定义更广泛的类型，像基本类型别名、联合类型、交叉类型、元组类型等都可以定义。

```ts
// 基本类型别名
type Username = string;

// 联合类型
type Result = 'success' | 'failure';

// 交叉类型
type AdminUser = { name: string } & { role: 'admin' };

// 元组类型
type Coordinate = [number, number];
```

interface：主要用来定义对象的形状，也就是描述对象包含哪些属性和方法。

**扩展方式**

- type：使用交叉类型（&）来扩展类型。
- interface：使用 extends 关键字进行继承扩展。

**声明合并**

- type：不支持声明合并。若定义两个同名的 type，会产生编译错误。

```ts
type Message = { text: string };
// 下面这行代码会报错，因为重复定义同名的 type
type Message = { sender: string };
```

- interface：支持声明合并。当定义多个同名的 interface 时，它们会自动合并成一个。

```ts
interface Car {
    brand: string;
}
interface Car {
    model: string;
}
// 合并后的 Car 接口同时包含 brand 和 model 属性
const myCar: Car = { brand: 'Toyota', model: 'Corolla' };
```

**与类的关系**

- type：可以描述类的实例类型，但不能像 interface 那样被类直接实现。不过可以通过类型断言来实现类似的功能。

```ts
type UserType = {
    name: string;
    sayHello(): void;
};
class User implements { sayHello: () => void } & UserType {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    sayHello() {
        console.log(`Hello, I'm ${this.name}`);
    }
}
```

- interface：能被类直接实现，用于约束类的结构。

```ts
interface UserInterface {
    name: string;
    sayHello(): void;
}
class User implements UserInterface {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    sayHello() {
        console.log(`Hello, I'm ${this.name}`);
    }
}
```


**对映射类型和条件类型的支持**

- type：可以很好地与映射类型和条件类型配合使用，因为它能够直接定义复杂的类型逻辑。

```ts

// 映射类型
type ReadonlyProps<T> = {
    readonly [P in keyof T]: T[P];
};
interface Props {
    name: string;
    age: number;
}
type ReadonlyPropsExample = ReadonlyProps<Props>;

// 场景2
// 条件类型
type IsString<T> = T extends string ? true : false;
type Result = IsString<string>; // true
```

- interface：一般不用于定义映射类型和条件类型，主要还是侧重于定义对象结构。
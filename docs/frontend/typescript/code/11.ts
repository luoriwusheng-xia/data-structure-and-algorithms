class Person {
  constructor(public name: string) {}
}

type PersonInstance = InstanceType<typeof Person>;
const person: PersonInstance = new Person('Alice');
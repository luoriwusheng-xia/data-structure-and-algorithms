function greet(): string {
  return 'Hello!';
}

type GreetReturnType = ReturnType<typeof greet>; // string
{
  interface Todo {
    title: string;
    description: string;
    completed: boolean;
  }

  type TodoWithoutDesc = Omit<Todo, 'description'>;
  const restTodo: TodoWithoutDesc = {
    title: 'Buy groceries',
    completed: false
  };

}
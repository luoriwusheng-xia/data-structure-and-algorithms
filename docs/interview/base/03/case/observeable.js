// 被观察的对象
class Observable {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }
  // 移除观察者
  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  // 通知所有观察者
  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class Observer {
  update(data) {
    // Perform necessary actions with the data
  }
}

const observable = new Observable();
// 初始化2个观察者
const observer1 = new Observer();
const observer2 = new Observer();

observable.addObserver(observer1);
observable.addObserver(observer2);

// Notify observers
observable.notify({
  message: 'Data updated',
});

// Remove observer
observable.removeObserver(observer2);

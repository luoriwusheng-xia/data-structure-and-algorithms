function createObject(name) {
  if (new.target) {
      this.name = name;
  } else {
      return { name: name };
  }
}

class Child extends createObject {}

const obj1 = new createObject('Obj1');
const obj2 = createObject('Obj2');

console.log(obj1); // createObject { name: 'Obj1' }
console.log(obj2); // { name: 'Obj2' }
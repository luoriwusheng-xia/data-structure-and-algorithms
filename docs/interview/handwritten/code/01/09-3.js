function Parent2() {
  this.name = 'parent2';
  this.play = [1, 2, 3];
}
function Child2() {
  this.type = 'child2';
}
Child2.prototype = new Parent2();

console.log(new Child2());
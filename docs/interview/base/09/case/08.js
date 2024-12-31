// 方法一：
var lis = document.getElementById('2223').getElementsByTagName('li');
for (var i = 0; i < 3; i++) {
  lis[i].index = i;
  lis[i].onclick = function () {
    alert(this.index);
  };
}

//方法二：
var lis = document.getElementById('2223').getElementsByTagName('li');
for (var i = 0; i < 3; i++) {
  lis[i].index = i;
  lis[i].onclick = (function (a) {
    return function () {
      alert(a);
    };
  })(i);
}

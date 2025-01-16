var goods = {   //手机库存
  'red|32G': 3,
  'red|64G': 1,
  'blue|32G': 7,
  'blue|32G': 6,
};
//中介者
var mediator = (function () {
  var colorSelect = document.getElementById('colorSelect');
  var memorySelect = document.getElementById('memorySelect');
  var numSelect = document.getElementById('numSelect');
  return {
    changed: function (obj) {
      switch (obj) {
        case colorSelect:
          //TODO
          break;
        case memorySelect:
          //TODO
          break;
        case numSelect:
          //TODO
          break;
      }
    }
  }
})();
colorSelect.onchange = function () {
  mediator.changed(this);
};
memorySelect.onchange = function () {
  mediator.changed(this);
};
numSelect.onchange = function () {
  mediator.changed(this);
};
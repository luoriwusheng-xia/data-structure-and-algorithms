function animate() {
  const element = document.getElementById('myElement');
  const position = parseInt(element.style.left) || 0;
  const speed = 2;

  // 更新元素位置
  element.style.left = position + speed + 'px';

  // 检查是否到达目标位置
  if (position < 200) {
    // 请求下一帧动画
    requestAnimationFrame(animate);
  }
}

// 开始执行动画
requestAnimationFrame(animate);

// 取消动画
let requestId;
function animate() {
  console.log('Animation frame');
  requestId = requestAnimationFrame(animate);
}
requestId = requestAnimationFrame(animate);
// 取消动画
cancelAnimationFrame(requestId);

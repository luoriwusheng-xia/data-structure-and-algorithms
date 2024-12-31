function mySetInterval(fn, time = 1000) {
  let timer = null;
  let isClear = false;

  function interval() {
    if (isClear) {
      isClear = false;
      clearTimeout(timer);
      return;
    }
    fn();
    timer = setTimeout(interval, time);
  }

  timer = setTimeout(interval, time);

  // 返回一个函数，允许外部调用这个函数，停止定时器， 这里本质形成了一个闭包
  return () => {
    isClear = true;
  };
}

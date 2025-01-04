function throttle(func, delay){
  let timer = 0;
  return function(...args){
    let context = this;

    if(timer) return // 当前有任务了，直接返回

    timer = setTimeout(function(){
      func.apply(context, args);
      timer = 0;
    },delay);
  }
}


// 测试代码
let cc = throttle(() => console.log(1, new Date()), 1000)

setInterval(() => {
  cc()
}, 200)
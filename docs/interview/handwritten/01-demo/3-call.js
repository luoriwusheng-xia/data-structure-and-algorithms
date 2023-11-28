/**
 * call 的第一个参数为 一个对象，函数中的this指向这个对象
 * 
 */
var o = {
    a: 1,
    say: function() {
        console.log("当前的对象--this-->", this)
        return "o对象的返回值"
    }
}

function a(a,b) {
    // 在这里调用 对象 o中的say方法和属性
    console.log("o对象中的属性a=", this.a);
    console.log("o对象中的方法 say=", this.say());
  
    console.log("call中传递的参数-->", a, b)
}

// call传递一个对象  则a这里的this指向的是 obj
a.call(o, "参数1", "参数2")

/**
 * a作为调用的主动者， 能够获取到o里面的所有属性和方法，直接改变了自身this的指向。
 * 
*/
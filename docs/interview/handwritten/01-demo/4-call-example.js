
 // 演示 call传入一个对象
var o = {
    a: 1,
    say: function() {
        console.log("对象o中的this--》", this);
    },
    name: "my name is o, i'am is an Object！",
    hi: function() {
        console.log("hi方法-->", this.name);
        return "hi return  的内容"
    }
}

function a() {
    console.log("函数a中的this-->",this)
}

function b(name) {
    console.log("b函数中的形参-》name-->", name);
    console.log("b函数中获取到o对象的name-->", this.name);
    console.log("执行o对象中的say方法-->", this.hi())

}

//a.call(o);  // a函数中打印的就是o整个对象  此时的 this === o(对象)


/**
 * 注意
 *      call的使用，对被调用者 o 中的this是没有影响的，只影响了主动调用者 b 中的this指向
 *      如果在b函数中调用o中的方法，o如果没有返回，你在b中这样 this.say()  执行后，say因为没有返回任何内容，所以 this.say() === undefined
 *      此时 b是继承了 o所有的属性和方法，这有别于  原型链的继承方式
*/
b.call(o, "张胖子");
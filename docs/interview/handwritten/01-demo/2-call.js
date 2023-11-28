/**
 *  用法 some.call(thisArgs[, 参数1， 参数2， 参数3]);
 *
 *  调用者： thisArgs  被调用着就是some
 *  作用，改变this的指向
 *
 * thisArgs的4种情况
 *      - 不传/ undefined/null  函数中的this指向 window， node中指向 global, 如果想要传参，就将thisArgs指定为null/undefined
 *      - 传递另一个函数名，this将指向该函数的引用
 *
 *      - 传递js的基础类型 (Number, Boolean, String)  this将指向基础类型的包装对象 比如 传"a" this将指向字符串的包装对象String
 */

 /**********3- 基础类型******************************************** */
function a(a,b) {
    console.log("我是a函数",a,b);
    console.log(this);
}
function b() {}

// 基本数据类型  Number
a.call(1, "hi", "bye");

// 基本数据类型  String
a.call("hi", "i'am", "string");

// 基本数据类型  Boolean
a.call(true, "i'am", "Boolean")

/*************end***************************************************** */

// 第四种情况， 传递一个对象  参见 3-call.js
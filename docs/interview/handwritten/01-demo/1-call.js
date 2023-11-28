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
 *      此demo只演示上面的2种情况，参见2-call.js  继续
 */
function a() {
    console.log(this);
    //console.log("参数列表", arguments);

    var name = "张三";
    function say() {
        console.log("a函数中定义的name=", name);
    }
    // 返回一个值
    //return 111;

    // 返回一个函数的引用-- 你可以 say()执行，打印出结果； say不执行，返回引用地址
    return say;
}
function b() {
}
function c() {
    console.log("C--this--》", this, globalThis);
}

/************1-不传*************************************************/
// c.call() //  浏览器环境 this就是window， node环境就是 globalThis
// c.call(null);
// c.call(undefined)
/************end************************************************* */

/***********2-传递函数名**************************************************** */
// b调用了a  然后打印了内容
a.call(b, 1,2,3)

var res1 = a.call(b)
console.log(res1); // 调用后，如果被调用者a有返回值， res1 就是返回值， 如果a没有return 内容，就是undfined
//res1() //直接调用

/************end*********************************************************** */
/**
 * 前面已经详细的解释了call的使用  apply的使用时异曲同工的，唯一的区别是
 * 
 * a.call(some, "参数1", "参数2", "参数3")
 * 
 * a.apply(some, ["参数1","参数2", "参数3"])
 * 
 *  就是传入实参的方式区别， call是参数列表， apply是需要传入一个数组或者类数组
 * 
 * 类数组： DOMLIST、 arguments(当然这个arguments是函数的形成，这个直接传递是不行的，但是它是类数组)，可以间接传
 */

 var obj = {
     a: 1,
     say: function() {
        console.log(this.a);
                    
     }
 }

 function b(a, b, c) {
    
    console.log("b函数的参数-->", a, b, c);
 }

 function c() {
    // 这里直接将c的arguments传递给apply  因为，在c函数里面， 只要c函数调用且传递实参，arguments就是一个实实在在的数据而不是空对象
    console.log("c调用时传递的参数是-->", arguments)
    b.apply(obj, arguments);
 }

 //c(1,2,3)

 // 下面的调用是不行的

// b.apply(obj, arguments)  //这里的 arguments只有在函数中才存在，所以这里会报错  arguments is not found   它当做变量了
/**
 * 注意  在Node的环境  argments是一个全局变量   是有内容的
 *  在window中  全局的arguments  是  没有定义的  是 null  所以  记得在function 中再去使用arguments
 * 
 * 其他的用途和 call一样的使用
 */

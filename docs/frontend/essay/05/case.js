/**
 * 通过添加标记，可以break指定的循环
 */

test: for (let i = 0; i < 10; i++) {
  console.log('第一层--  i', i);
  for (let j = 0; j < 5; j++) {
    console.log('第二层---》 j', j);

    if (j === 2) {
      break test;
    }
  }
}
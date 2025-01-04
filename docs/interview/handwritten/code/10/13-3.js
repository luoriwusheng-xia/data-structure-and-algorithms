function getTenNum(testArray, n) {
  if(testArray.length === 0) return []
  if (n> testArray.length ) return  []

  // 先克隆一遍
  const cloneArr = [...testArray];
  let result = [];

  for (let i = 0; i < n; i++) {
    const ran = Math.floor(Math.random() * (cloneArr.length - i));

    // 这里其实是没有进行去重处理的
    result.push(cloneArr[ran]);

    // 将后面的值置换到前面， 由于 n 一定是小于 testArray.length, 所以不会越界
    cloneArr[ran] = cloneArr[cloneArr.length - i - 1];
  }
  return result;
}
const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const resArr = getTenNum(testArray, 14);

console.log(resArr);

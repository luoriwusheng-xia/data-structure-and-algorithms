function getTenNum(testArray, n) {
  if (testArray.length === 0) return []

  if (n > testArray.length) return []

  let hash = {};
  let result = [];
  let ranNum = n;

  while (ranNum > 0) {
    const ran = Math.floor(Math.random() * testArray.length);

    // 做标记
    if (!hash[ran]) {
      hash[ran] = true;
      result.push(ran);
      ranNum--;
    }
  }

  return result;
}
const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const resArr = getTenNum(testArray, 10);

console.log(resArr)
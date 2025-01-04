function getTenNum(testArray, n) {
  if (testArray.length === 0) return []

  if (n > testArray.length) return []

  let result = [];
  for (let i = 0; i < n; i++) {
    const random = Math.floor(Math.random() * testArray.length);
    const cur = testArray[random];
    if (result.includes(cur)) {
      i--;
      continue;
    }
    result.push(cur);
  }
  return result;
}

const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const resArr = getTenNum(testArray, 10);

console.log(resArr)
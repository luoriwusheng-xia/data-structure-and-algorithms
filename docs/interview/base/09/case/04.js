var arr = [3, 1, 4, 6, 5, 7, 2];
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr; // 基线条件：数组为空或只有一个元素时直接返回
  }

  // 选择基准， 可以是第一个元素，可以是中间的元素，可以是最后，或者随机中间位置的元素
  var cIndex = Math.floor(arr.length / 2);

  // 一定要把这个元素拿出来，否则下面循环会再次将c放进去;
  // 注意这里是返回的数组
  var c = arr.splice(cIndex, 1)[0];

  var left = [];
  var right = [];

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < c) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  // 递归排序并合并
  // return quickSort(left).concat(c, quickSort(right));
  // 也可以这样写
  return [...quickSort(left), c, ...quickSort(right)];
}

console.log(quickSort(arr));

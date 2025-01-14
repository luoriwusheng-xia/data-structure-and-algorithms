function bubbleSort(list) {
  var n = list.length;
  if (!n) return [];

  for (var i = 0; i < n; i++) {
    // 注意这里需要 n - i - 1
    for (var j = 0; j < n - i - 1; j++) {
      if (list[j] > list[j + 1]) {
        var temp = list[j + 1];
        list[j + 1] = list[j];
        list[j] = temp;
      }
    }
  }
  return list;
}

# 数学

### X 的平方根

> 在不使用 sqrt(x) 函数的情况下， 得到 x 的平方根的整数部分

i = sqrt\{x\}

暴力破解思路是

```
2 <  根号 x < x-1

for循环 逐个遍历

i * i < x

(i + 1) * (i +1) > x

说明，不是 i， 就是 i+1 , 再次比较哪个更接近 根号x
```

#### 二分法查找

<<<./demo/101.js

时间复杂度： log\{n\}

#### 牛顿迭代

---

<div style='display: flex; gap: 12px; '>
  <el-tag effect="dark" round>二分法</el-tag>
  <el-tag effect="dark" round>牛顿迭代</el-tag>
</div>

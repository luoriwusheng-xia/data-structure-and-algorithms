let str = `abcda`

let result = {}

for(let i=0; i<str.length; i++) {
  if (result[str[i]]) {
    result[str[i]] ++
  } else {
    result[str[i]] = 1
  }
}

console.log(result);

// { a: 2, b: 1, c: 1, d: 1 }
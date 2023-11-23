const { sum } = require('./sum.js')
const a = 1

let c = sum(1, 2)

console.log(c);

module.exports = {
  say () {
    console.log(a)
  }
}
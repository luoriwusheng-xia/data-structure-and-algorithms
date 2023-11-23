'use strict';

const sum = (a, b) => a + b;

const a = 1;

const c = sum(1, 2);

console.log(c);
var app = {
  say () {
    console.log(a);
  }
};

module.exports = app;

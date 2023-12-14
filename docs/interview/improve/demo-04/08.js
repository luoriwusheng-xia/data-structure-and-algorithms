const express = require('express');
const proxy = require('http-proxy-middleware');
// proxy api requests
const exampleProxy = proxy(options); // 这里的 options 就是 webpack 里面的 proxy 选项对应的每个选项

// mount `exampleProxy` in web server
const app = express();
app.use('/api', exampleProxy);
app.listen(3000);
proxy: {
  '/api': {
    target: 'http://www.example.com', // your target host
      changeOrigin: true, // needed for virtual hosted sites
      pathRewrite: {
        '^/api': ''  // rewrite path
      }
  }
}
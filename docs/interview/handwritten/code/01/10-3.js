// 情况1
Promise.resolve(123).finally((data) => {
  // 这里传入的函数，无论如何都会执行
  console.log(data); // undefined
});

// 情况2 (这里，finally方法相当于做了中间处理，起一个过渡的作用)
Promise.resolve(123)
  .finally((data) => {
    console.log(data); // undefined
  })
  .then((data) => {
    console.log(data); // 123
  });

// 情况3 (这里只要reject，都会走到下一个then的err中)
Promise.reject(123)
  .finally((data) => {
    console.log(data); // undefined
  })
  .then(
    (data) => {
      console.log(data);
    },
    (err) => {
      console.log(err, 'err'); // 123 err
    }
  );

// 情况4 (一开始就成功之后，会等待finally里的promise执行完毕后，再把前面的data传递到下一个then中)
Promise.resolve(123)
  .finally((data) => {
    console.log(data); // undefined
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('ok');
      }, 3000);
    });
  })
  .then(
    (data) => {
      console.log(data, 'success'); // 123 success
    },
    (err) => {
      console.log(err, 'err');
    }
  );

// 情况5 (虽然一开始成功，但是只要finally函数中的promise失败了，就会把其失败的值传递到下一个then的err中)
Promise.resolve(123)
  .finally((data) => {
    console.log(data); // undefined
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('rejected');
      }, 3000);
    });
  })
  .then(
    (data) => {
      console.log(data, 'success');
    },
    (err) => {
      console.log(err, 'err'); // rejected err
    }
  );

// 情况6 (虽然一开始失败，但是也要等finally中的promise执行完，才能把一开始的err传递到err的回调中)
Promise.reject(123)
  .finally((data) => {
    console.log(data); // undefined
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('resolve');
      }, 3000);
    });
  })
  .then(
    (data) => {
      console.log(data, 'success');
    },
    (err) => {
      console.log(err, 'err'); // 123 err
    }
  );
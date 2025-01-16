let myEvent = {
  // ...
  stop: e => {
      e.stopPropagation();
      e.preventDefault();
  }
};

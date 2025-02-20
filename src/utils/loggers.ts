const loggers = {
  layers: {
    component: (...args: any[]) => {
      console.log(
        "%c[COMPONENTS]",
        "color: white; background-color: #3b82f6;",
        ...args
      );
    },
    stores: (...args: any[]) => {
      console.log(
        "%c[STORES]",
        "color: white; background-color: #10b981;",
        ...args
      );
    },
    storage: (...args: any[]) => {
      console.log(
        "%c[STORAGE]",
        "color: white; background-color: #f59e0b;",
        ...args
      );
    },
  },
};

export default loggers;

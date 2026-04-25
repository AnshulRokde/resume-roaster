export function register() {
  // Promise.try was added in Node.js 22. Polyfill for Node.js 20.
  if (!("try" in Promise)) {
    Object.assign(Promise, {
      try: <T>(fn: () => T | PromiseLike<T>): Promise<T> =>
        new Promise<T>((resolve, reject) => {
          try {
            resolve(fn());
          } catch (e) {
            reject(e);
          }
        }),
    });
  }
}

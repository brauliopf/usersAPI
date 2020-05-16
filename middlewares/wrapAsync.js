// https://thecodebarbarian.com/80-20-guide-to-express-error-handling
// Repalces the "try {} catch {}"
// Must still use async/await or then in the async call
// Must handle errors

export const wrapAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}
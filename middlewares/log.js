exports.logger = function logger(req, res, next) {
  // console.log(`Request URL: ${req.method} ${req.url}`);
  next();
};
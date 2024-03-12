const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  console.log(token && "isAuthenticated");
  if (!token) {
    return next(new ErrorHandler("Login first to handle this source"), 401);
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

exports.authorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler("Only admin has access", 401));
    }
    console.log("isAuthorized");
    next();
  };
};

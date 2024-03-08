const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/Users");
const ErrorHandler = require("../utils/ErrorHandler");
const sendToken = require("../utils/jwt");
const sendMailer = require("../utils/email");
const jwt = require("jsonwebtoken");
//Registering user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { email, password, name } = req.body;
  console.log(email, password, name, req.file);
  let avatar;
  let Base_url = process.env.BACKEND_URL;

  if (process.env.NODE_ENV === "development") {
    Base_url = `${req.protocol}://${req.get("host")}`;
  }
  if (req.file) {
    avatar = `${Base_url}/uploads/user/${req.file.originalname}`;
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });
  console.log(user);
  sendToken(user, 201, res);
});

//Login user
exports.loginuser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  console.log("selectQuery===>", user);
  if (!user) {
    return next(new ErrorHandler("invalid name or password", 400));
  }
  if (!(await user.isValidPassword(password))) {
    return next(new ErrorHandler("incorrect password", 400));
  }
  sendToken(user, 200, res);
});

//Logiut user
exports.logoutuser = catchAsyncError(async (req, res, next) => {
  res
    .cookie("token", null, {
      expiresIn: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "loggedout successfully",
    });
});

//Forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });

  let BaseUrl = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "development") {
    BaseUrl = `${req.protocol}://${req.get("host")}`;
  }
  const resetUrl = `${BaseUrl}/password/reset/${resetToken}`;
  const message = `Your reset URL is as follows \n\n
    ${resetUrl} \n\n if you have not request then ignore it.`;

  try {
    // sendMailer({
    //   to: user.email,
    //   subject: "M-mart password recovery mail",
    //   message: message,
    // });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
      token: `${resetUrl} ${resetToken}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});

//Resetting password
exports.resetpassword = catchAsyncError(async (req, res, next) => {
  // const resetPasswordToken = crypto
  //   .createHash("sha256")
  //   .update(req.params.token)
  //   .digest("hex");

  const resetPasswordToken = req.params.token;

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new ErrorHandler("Password reset token is invalid or expired"));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match"));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });
  sendToken(user, 201, res);
});

//Get specific userProfile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Change password by authenticated user
exports.changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  //check old password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
  res.status(200).json({
    success: true,
  });
});

//update profile by authenticated user
exports.updateprofile = catchAsyncError(async (req, res, next) => {
  let newProfile = {
    name: req.body.name,
    email: req.body.email,
  };
  let avatar;
  let Baseurl = process.env.BACKEND_URL;

  if (process.env.NODE_ENV === "production") {
    Baseurl = `${req.protocol}://${req.get("host")}`;
  }
  if (req.file) {
    avatar = `${Baseurl}/uploads/user/${req.file.originalname}`;
  }
  newProfile = { ...newProfile, avatar };

  const user = await User.findByIdAndUpdate(req.user.id, newProfile, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//pending admin controllers(getallusers,getuser,updateuser)

//admin delete user
exports.deleteuser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

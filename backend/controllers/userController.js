const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const crypto = require("crypto");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const { sendMail } = require("../utils/sendmail");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "This Is A Sample Id",
      url: "ProfileUrl",
    },
  });

  sendToken(user, 201, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email And Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password", 401));
  }

  sendToken(user, 201, res);
});

exports.logoutUser = catchAsyncErrors((req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Log Out Success!",
  });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new ErrorHandler("There Is No User With This Email!", 404));
  }

  const resetToken = user.getPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If You Have Not Request This Email Then, Please Ignore IT`;

  try {
    await sendMail({
      email: email,
      subject: "Ecommerce Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Recovery Mail Was Sent To ${email}`,
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(e.message, 500));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token Is Invalid Or Has Been Expired!",
        400
      )
    );
  }

  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new ErrorHandler("Password Confirm Missmatch", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

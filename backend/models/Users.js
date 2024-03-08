const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter the username"],
  },
  email: {
    type: String,
    required: [true, "Enter the mail"],
    // unique: true,
    validate: [validator.isEmail, "Please enter the valid address"],
  },
  password: {
    type: String,
    required: [true, "Enter the passowrds"],
    min: [6, "password should have atleast 6 characters"],
    max: [20, "password can't exceed atleast 20 characters"],
    select: false,
  },
  avatar: {
    type: String,
  },

  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
userSchema.methods.isValidPassword = async function (enteredPassword) {
  console.log("isValidPassword==>", enteredPassword);
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  //Creating reset token
  const resetToken = (this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex"));
  //Setting expire time
  this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);

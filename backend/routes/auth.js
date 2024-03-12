const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  registerUser,
  loginuser,
  logoutuser,
  forgotPassword,
  resetpassword,
  changePassword,
  updateprofile,
  deleteuser,
} = require("../controllers/userControllers");
const { isAuthenticated, authorized } = require("../middlewares/authenticate");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("File==>", file);
      cb(null, path.join(__dirname, "..", "uploads/user"));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginuser);
router.route("/logout").get(logoutuser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").post(resetpassword);
router.route("/password/change").post(isAuthenticated, changePassword);
router
  .route("/password/updateuser")
  .put(isAuthenticated, upload.single("avatar"), updateprofile);
//Admin routes
router
  .route("/admin/deleteuser/:id")
  .delete(isAuthenticated, authorized("admin"), deleteuser);
module.exports = router;

const express = require("express");
const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  createReview,
  deleteReview,
  getAllReviews,
} = require("../controllers/ProductsController");
const route = express.Router();
const multer = require("multer");
const path = require("path");
const { isAuthenticated, authorized } = require("../middlewares/authenticate");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("ProductImages==>", file);
      console.log(path.join(__dirname, "..", "uploads/product"));
      cb(null, path.join(__dirname, "..", "uploads/product"));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

route.route("/products").get(getProducts);
route.route("/product/:id").get(getSingleProduct);
route.route("/product/review").post(isAuthenticated, createReview);
//admin routes
//create new peoduct
route
  .route("/admin/product/new")
  .post(
    isAuthenticated,
    authorized("admin"),
    upload.array("images"),
    newProduct
  );

//get all products
route
  .route("/admin/products")
  .get(isAuthenticated, authorized("admin"), getAdminProducts);

//delete product
route
  .route("/admin/product/:id")
  .delete(isAuthenticated, authorized("admin"), deleteProduct);

//update product
route
  .route("/admin/product/:id")
  .put(
    isAuthenticated,
    authorized("admin"),
    upload.array("images"),
    updateProduct
  );
//delete review
route
  .route("/admin/product/deletereview/:id/:productId")
  .put(isAuthenticated, authorized("admin"), deleteReview);

//get reviews
route
  .route("/admin/product/getreviews/:productId")
  .get(isAuthenticated, authorized("admin"), getAllReviews);

module.exports = route;

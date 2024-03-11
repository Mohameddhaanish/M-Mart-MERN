const express = require("express");
const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
} = require("../controllers/ProductsController");
const route = express.Router();
const multer = require("multer");
const path = require("path");
const { isAuthenticated, authorized } = require("../middlewares/authenticate");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "uploads/product"));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

route.route("/products").get(getProducts);
route.route("/product/:id").get(getSingleProduct);

//admin routes
route
  .route("/admin/product/new")
  .post(
    isAuthenticated,
    authorized("admin"),
    upload.array("images", 2),
    newProduct
  );

route
  .route("/admin/products")
  .get(isAuthenticated, authorized("admin"), getAdminProducts);

route
  .route("/admin/product/:id")
  .delete(isAuthenticated, authorized("admin"), deleteProduct);

route
  .route("/admin/product/:id")
  .put(
    isAuthenticated,
    authorized("admin"),
    upload.array("images"),
    updateProduct
  );

module.exports = route;

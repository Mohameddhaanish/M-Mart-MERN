const Products = require("../models/Products");
const ErrorHandler = require("../utils/ErrorHandler");
const cathAsynError = require("../middlewares/catchAsyncError");
//Get-all products
exports.getProducts = cathAsynError(async (req, res, next) => {
  const products = await Products.find();
  res.json({
    success: true,
    count: products.length,
    products,
  });
});

//Post-create new product
exports.newProduct = cathAsynError(async (req, res, next) => {
  const product = await Products.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//Get-getspecific product
exports.getSingleProduct = cathAsynError(async (req, res, next) => {
  const product = await Products.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(201).json({
    success: true,
    product,
  });
});

exports.updateProduct = cathAsynError(async (req, res, next) => {
  const product = await Products.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const update = await Products.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    update,
  });
});

exports.deleteProduct = cathAsynError(async (req, res, next) => {
  const product = await Products.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const deleteProduct = await Products.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product Deleted!",
  });
});

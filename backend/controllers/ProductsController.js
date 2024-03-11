const Products = require("../models/Products");
const ErrorHandler = require("../utils/ErrorHandler");
const cathAsynError = require("../middlewares/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//Get-all products
exports.getProducts = cathAsynError(async (req, res, next) => {
  let products;
  const page = req.query.page;
  const resPerPage = 3;
  const skip = resPerPage * (page - 1);
  if (req.query.new) {
    products = await Products.find().sort({ createdAt: -1 }).limit(5);
  } else if (req.query.category) {
    products = await Products.find({ category: { $in: [req.query.category] } });
  } else if (req.query.name) {
    products = await Products.find({
      name: { $regex: req.query.name, $options: "i" },
    });
  } else {
    products = await Products.find()
      .skip(skip)
      .limit(resPerPage)
      .select("name");
  }
  res.json({
    success: true,
    products,
    count: await Products.countDocuments({}),
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

//Admin Routes

//Create Product - /api/v1/product/new
exports.newProduct = cathAsynError(async (req, res, next) => {
  let images = [];
  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }

  if (req.files.length > 0) {
    req.files.forEach((file) => {
      let url = `${BASE_URL}/uploads/product/${file.originalname}`;
      images.push({ image: url });
    });
  }

  req.body.images = images;

  req.body.user = req.user.id;
  const product = await Products.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//Update Product - api/v1/product/:id
exports.updateProduct = cathAsynError(async (req, res, next) => {
  let product = await Products.findById(req.params.id);

  //uploading images
  let images = [];

  //if images not cleared we keep existing images
  if (req.body.imagesCleared === "false") {
    images = product.images;
  }
  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }

  if (req.files.length > 0) {
    req.files.forEach((file) => {
      let url = `${BASE_URL}/uploads/product/${file.originalname}`;
      images.push({ image: url });
    });
  }

  req.body.images = images;

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product = await Products.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
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

// get admin products  - api/v1/admin/products
exports.getAdminProducts = cathAsynError(async (req, res, next) => {
  const products = await Products.find();
  res.status(200).send({
    success: true,
    products,
  });
});

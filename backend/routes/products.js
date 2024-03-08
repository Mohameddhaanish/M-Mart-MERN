const express=require('express');
const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/ProductsController');
const route=express.Router();

route.route('/products').get(getProducts);
route.route('/product/new').post(newProduct);
route.route('/product/:id')
                            .get(getSingleProduct)
                            .put(updateProduct)
                           .delete(deleteProduct)
module.exports=route;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    image: {
        data: Buffer,
        contentType: String
    },
    productName: String,
    productId: Number,
    quantity: Number,
    price: Number,
    orderTime: String,
    customer: String
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
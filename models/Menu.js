const mongoose = require('mongoose');
const Review = require('./Review'); 

const menuSchema = new mongoose.Schema({
    productName: String,
    productId: String,
    rating: Number,
    price: Number,
    category: String,
    description: String,
    image: {
        data: Buffer,
        contentType: String
    }
});

// Pre - remove hook to delete associated reviews
menuSchema.pre('remove', async function (next) {
    try {
        await Review.deleteMany({ menuItemId: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
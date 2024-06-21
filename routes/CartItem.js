
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');

// Get cart items by username
router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const cartItems = await CartItem.find({ userId: user._id }).populate('menuItemId');
        res.status(200).json({ cartItems });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add item to cart
router.post('/add', async (req, res) => {
    const { userId, menuItemId } = req.body;
    try {
        // Ensure userId and menuItemId are valid ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ error: 'Invalid user ID or menu item ID' });
        }

        let cartItem = await CartItem.findOne({ userId, menuItemId });
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cartItem = new CartItem({ userId, menuItemId });
        }
        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
    const { userId, menuItemId } = req.body;
    try {
        // Ensure userId and menuItemId are valid ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ error: 'Invalid user ID or menu item ID' });
        }

        let cartItem = await CartItem.findOne({ userId, menuItemId });
        if (!cartItem) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        if (cartItem.quantity === 1) {
            await CartItem.findOneAndDelete({ userId, menuItemId });
        } else {
            cartItem.quantity -= 1;
            await cartItem.save();
        }
        res.status(200).json({ message: 'Item quantity updated successfully' });
    } catch (error) {
        console.error('Error updating item quantity in cart:', error);
        res.status(500).json({ error: 'Failed to update item quantity in cart' });
    }
});

module.exports = router;

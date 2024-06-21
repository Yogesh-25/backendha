const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');

router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const cartItems = await CartItem.find({ userId: username }).populate('menuItemId');
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


// Remove item cart
router.post('/remove', async (req, res) => {
    const { userId, menuItemId } = req.body;
    try {
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
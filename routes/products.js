const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const Menu = require('../models/Menu');
const Review = require('../models/Review');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         const image = {
//             data: req.file.buffer,
//             contentType: req.file.mimetype
//         };

//         const newProduct = new Product({
//             image: image,
//             productName: req.body.productName,
//             productId: req.body.productId,
//             quantity: req.body.quantity,
//             price: req.body.price,
//             orderTime: req.body.orderTime,
//             customer: req.body.customer
//         });

//         await newProduct.save();

//         res.status(201).send('Image uploaded successfully');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

// router.get('/image/:productName', async (req, res) => {
//     try {
//         const product = await Product.findOne({ productName: req.params.productName });
//         if (!product || !product.image) {
//             return res.status(404).send('Image not found');
//         }
//         res.set('Content-Type', product.image.contentType);
//         res.send(product.image.data);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });
// Route to handle creating new menu item
router.post('/menu', upload.single('image'), async (req, res) => {
    try {
        // console.log('Request body:', req.body);
        // console.log('File:', req.file);
        const { productName, productId, rating, price, category, description } = req.body;
        const image = req.file ? {
            data: req.file.buffer,
            contentType: req.file.mimetype
        } : null;

        // Check if a product with the same name already exists
        const existingProduct = await Menu.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with the same name already exists' });
        }
        const newMenuItem = new Menu({
            productName,
            productId,
            rating,
            price,
            category,
            description,
            image
        });

        await newMenuItem.save();
        res.status(201).json({ message: 'Menu item added successfully' });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ message: 'Failed to add menu item', error: error.message });
    }
});

// Update a menu item
router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, description, price, category, rating } = req.body;

        const updatedFields = {
            productName,
            description,
            price,
            category,
            rating
        };

        if (req.file) {
            updatedFields.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const updatedMenuItem = await Menu.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item updated successfully', updatedMenuItem });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ message: 'Failed to update menu item', error: error.message });
    }
});


router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const menuItem = await Menu.findById(id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        await menuItem.deleteOne();
        await Review.deleteMany({ menuItemId: id });

        res.json({ success: true, message: 'Menu item and associated reviews deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/showmenu', async (req, res) => {
    try {
        const menuItems = await Menu.find();
        res.json(menuItems);
        // console.log(menuItems)
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get('/count', async (req, res) => {
    try {
        const totalCount = await Menu.countDocuments();
        res.json({ totalCount });
        // console.log(totalCount);
    } catch (error) {
        console.error('Error counting products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

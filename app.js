const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const MenuItem = require('./models/Menu');
const User = require('./models/User');
const Review = require('./models/Review');
const authRoutes = require('./routes/authRoutes');
const authAdmin = require('./routes/authAdmin');
const categoriesRouter = require('./routes/categories');
const productRoutes = require('./routes/products');
const reviewsRouter = require('./routes/Reviews');
const cartItem = require('./routes/CartItem');
const port = process.env.port|| 5000;

/*mongoose.connect('mongodb://127.0.0.1:27017/hotel-data')
    .then(() => {
        console.log("Connected to MongoDB...")
    }).catch((err) => {
        console.log("MongoDB error", err);
    });*/

const mongoURI = 'mongodb+srv://hoteldata:hoteldata@cluster0.m3napu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB...");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', authAdmin);
app.use('/api/categories', categoriesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api', cartItem)
app.use('/api/products', productRoutes);

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/api/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await MenuItem.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get user by username
app.get('/by-username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user by username:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, username, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        res.status(200).json({ success: true, username: user.username, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Route to delete a user profile
app.delete('/api/users/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find user by ID and delete it
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User profile deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Create endpoint to get count of new users in the last 24 hours
app.get('/api/users/newcount', async (req, res) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // Calculate date 24 hours ago
        const count = await User.countDocuments({ createdAt: { $gte: yesterday } });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching new user count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create endpoint to get total user count
app.get('/api/users/totalcount', async (req, res) => {
    try {
        const totalCount = await User.countDocuments();
        res.json({ totalCount });
    } catch (error) {
        console.error('Error fetching total user count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create an endpoint to get the total review count
app.get('/api/reviews/totalcount', async (req, res) => {
    try {
        const totalCount = await Review.countDocuments();
        res.json({ totalCount });
    } catch (error) {
        console.error('Error fetching total review count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

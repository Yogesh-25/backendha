const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const MenuItem = require('../models/Menu');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get average rating accorrding to menuItemId
router.get('/average/:menuItemId', async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const reviews = await Review.find({ menuItemId });

        if (reviews.length === 0) {
            return res.json({ averageRating: 5 });
        }

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        res.json({ averageRating });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add a new review or update existing one
router.post('/', async (req, res) => {
    try {
        const { menuItemId, username, userId, email, rating, feedback } = req.body;

        const existingReview = await Review.findOne({ menuItemId, userId, email });

        if (existingReview) {
            // Calculate the new average rating
            const newAverageRating = (existingReview.rating + rating) / 2;
            existingReview.rating = newAverageRating;
            existingReview.feedback = feedback;
            await existingReview.save();
            return res.status(200).json({ success: true, message: 'Review updated successfully' });
        } else {
            // Check if there are existing reviews
            const reviews = await Review.find({ menuItemId });
            if (reviews.length === 0) {
                const totalRating = 5 + rating;
                const newAverageRating = totalRating / (2);
                const newReview = new Review({ menuItemId, username, userId, email, rating: newAverageRating, feedback });

                await newReview.save();
                return res.status(201).json({ success: true, message: 'Review added successfully', averageRating: newAverageRating });
            } else {
                // Calculate the new average rating
                const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0) + rating;
                const newAverageRating = totalRating / (reviews.length + 1);
                const newReview = new Review({ menuItemId, username, userId, email, rating, feedback });
                await newReview.save();
                return res.status(201).json({ success: true, message: 'Review added successfully', averageRating: newAverageRating });
            }
        }
    } catch (error) {
        console.error('Error adding or updating review:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Delete a review by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.json({ success: true, message: 'Review deleted successfully', deletedReview });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;

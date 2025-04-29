const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true,
        maxLength: [100, "Product name cannot exceed 100 characters"]
    },
    price: {
        type: Number,
        required: true,
        default: 0.0
    },
    description: {
        type: String,
        required: [true, "Please Enter Product description"]
    },
    ratings: {
        type: Number, // ✅ Fixed from String to Number
        default: 0
    },
    images: [
        {
            image: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: ["Please enter product category"],
        // enum: {
            values: [
                'Electronics',
                'Mobile Phones',
                'Laptops',
                'Accessories',
                'Headphone',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message: "Please select correct category"
        // }
    },
    seller: {
        type: String,
        required: [true, "Please enter product seller"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        max: [20, 'Product stock cannot exceed 20'] // ✅ Changed maxLength to max
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User', // ✅ Reference to User model
                required: true 
            },
            name: { 
                type: String, 
                required: true 
            },
            rating: {  // ✅ Fixed naming for consistency
                type: Number,
                required: true
            },
            comment: { 
                type: String, 
                required: true 
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ Fixed Mongoose Model Declaration
const Product = mongoose.model('Product', productSchema);

module.exports = Product;

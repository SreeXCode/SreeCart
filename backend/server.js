
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const multer = require("multer");
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads', 'user'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });



const { isAuthenticatedUser, authorizeRoles } = require("./middlewares/authenticate"); // Import middleware

const connectDatabase = require('./config/database'); // import the database connection
connectDatabase() // call the database connection function

const Product = require('./models/productModel')
const Order = require('./models/orderModel');

const { getSearchQuery, getPagination } = require('./utils/searchHelper');

dotenv.config({ path: path.join(__dirname, "config/config.env") })
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, // <- this is important!
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));



// Athentication Route
app.get("/AuthenticatedUser", isAuthenticatedUser, (req, res) => {
    const user = req.user
    res.status(200).json({
        success: true,
        authenticated: true,
        user
    });
});

//////////////////////////////////////////////////////////////////////////////////////
// PRODUCTS ROUTES

// Admin : Create products
app.post('/admin/product/new', isAuthenticatedUser, authorizeRoles("admin"), async (req, res) => {
    try {
        req.body.user = req.user.id;
        const products = await Product.create(req.body);
        res.status(201).json({ success: true, products: products });
        console.log("created product:", products)
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Products
const qs = require('qs');// Query String ➜ Object (Parsing)
app.set('query parser', str => qs.parse(str));

app.get('/products', async (req, res) => {
    try {

        const { keyword, category, price, pageNo } = req.query;
        console.log('req.query', req.query); // should be { gte: "50000" }

        // Generate the search query
        const searchQuery = getSearchQuery(keyword, category, price);

        // ✅ Pagination (8 items per page) Next page that 8 items skip
        const PagePerLimit = 8
        const { skipProducts, PagePerProduct } = getPagination(pageNo, PagePerLimit);

        // Fetch products with pagination
        const products = await Product.find(searchQuery).skip(skipProducts).limit(PagePerProduct);

        // Get total count of matching products
        const FilteredProductsCount = await Product.countDocuments(searchQuery);
        const TotalProductsCount = await Product.countDocuments({});
        let ProductsCount = TotalProductsCount;

        if (FilteredProductsCount !== TotalProductsCount) {
            ProductsCount = FilteredProductsCount
        }

        // total pages
        const totalPages = Math.ceil(ProductsCount / PagePerProduct);

        res.status(200).json({
            success: true,
            count: ProductsCount,
            resPerPage: PagePerProduct,
            currentPage: Number(pageNo),
            totalPages,
            products: products
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Single Product
app.get('/product/:id', async (req, res) => {
    const SingleProduct = await Product.findById(req.params.id)

    if (!SingleProduct) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }
    res.status(201).json({
        success: true,
        SingleProduct: SingleProduct

    })
})

//Update Product
app.put('/product/:id', async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        // console.log(product);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            success: true,
            product: product

        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

})

// Delete Product
app.delete('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        // Delete the product using findByIdAndDelete()
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Product Deleted Successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


//////////////////////////////////////////////////////////////////////////////////////
// AUTHENTICATION ROUTES
const User = require('../backend/models/userModel')
const bcrypt = require('bcrypt');

// Register 
app.post('/register', upload.single('avatar'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let avatar
        if (req.file) {
            //image URL path 
            avatar = `${req.protocol}://${req.get('host')}/uploads/user/${req.file.filename}`

        }

        const user = await User.create({
            name,
            email,
            password,
            avatar
        });

        const token = user.getJwtToken()
        console.log('token', token)

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevents access via JavaScript (XSS protection)
            secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
            sameSite: "Strict", // Prevents CSRF attacks
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
        });

        res.status(201).json({
            success: true,
            user,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message // This will send validation error messages
        });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."

            });
        }

        // 2️⃣ Find the user in the database
        const user = await User.findOne({ email }).select("+password"); // Ensure password is selected
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // 3️⃣ Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // 4️⃣ Generate JWT token
        const token = user.getJwtToken();

        // 5️⃣ Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevents access via JavaScript (XSS protection)
            secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
            sameSite: "Strict", // Prevents CSRF attacks
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
        });


        // 6️⃣ Send response (excluding token in JSON)
        res.status(200).json({
            success: true,
            message: "Login successful!",
            user,
        });


    } catch (error) {
        // 6️⃣ Handle unexpected errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// ✅ Logout route (clears token from cookies)
app.post("/logout", isAuthenticatedUser, (req, res) => {
    res.cookie("token", " ", {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSWORD RESET ROUTES
const sendEmail = require("./utils/email");
const crypto = require("crypto");

// Forgot Password 
app.post('/password/forgot', async (req, res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({ email});
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        const resetToken = user.getResetToken();
        console.log('reset token raw :', resetToken)
        await user.save({ validateBeforeSave: false });

        // Create reset URL (http://localhost:3000/password/reset/9a7ccf6f0bd3c5fcc41bca082c6c12dc17b72cd9)
       const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

        const message = `Your password reset URL is as follows:\n\n${resetUrl}\n\n 
                         If you have not requested this email, please ignore it.`;

        await sendEmail({ email: user.email, subject: "SreeCart Password Recovery", message });
        res.status(200).json({ success: true, message: `Email sent to ${user.email}`, resetToken});

    } catch (error) {
        console.error("Error in forgot password: ", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

// Forgot Password / reset
app.post('/password/reset/:token', async (req, res) => {
    try {
        console.log("req.params.token", req.params.token)
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        console.log("hashed resetPasswordToken :", resetPasswordToken) //ithum first hash cheyithathum onnu

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or expired' });
        }

        if (!req.body.password || !req.body.confirmPassword) {
            return res.status(400).json({ success: false, message: "Both password fields are required" });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
        console.log("New password received:", req.body.password);

        user.password = req.body.password; // Ensure password is assigned before saving
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // Generate JWT token
        const token = user.getJwtToken();

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevents access via JavaScript (XSS protection)
            sameSite: "Strict", // Prevents CSRF attacks
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
        });

        // ✅ **Fix: Send a response after setting the cookie**
        res.status(200).json({
            success: true,
            message: "Password Reset successfully",
        });

    } catch (error) {
        console.error("Error in reset password: ", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MANAGE USER
// Get User Profile - http://localhost:8000/myprofile
app.get('/myprofile', isAuthenticatedUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// Change Password - http://localhost:8000/password/change
app.put('/password/change', isAuthenticatedUser, async (req, res) => {

    try {
        const { oldPassword, newPassword } = req.body
        const user = await User.findById(req.user.id).select('+password')

        // Compare the entered old password with the stored old hashed password
        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password."
            });
        }

        //Assigning new password
        user.password = newPassword
        await user.save()

        res.status(200).json({
            success: true,
            message: "Password Chenged successfully.",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message
        })
    }

})




// Update Profile
const validator = require("validator");
app.put('/profile/update', isAuthenticatedUser, upload.single('avatar'), async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }

        const newUserData = {
            name,
            email,
        };
        if (req.file) {
            newUserData.avatar = `${req.protocol}://${req.get('host')}/uploads/user/${req.file.filename}`;
        }
        console.log('newUserData', newUserData)

        // Find user and update
        const user = await User.findByIdAndUpdate(req.user, newUserData, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADMIN MANAGE ROUTES
// Admin: Get All Users
app.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

// Admin: Get Specific User
app.get('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with this id ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

//Admin:Update User(example change role etc)
app.put('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {

    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }
        console.log(newUserData)

        // Validate email format
        if (!validator.isEmail(newUserData.email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }

        // Find user and update
        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

})

// Admin: Delete User
app.delete('/admin/user/:id', isAuthenticatedUser, authorizeRoles("admin"), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with ID: ${req.params.id}`
            });
        }

        await User.deleteOne({ _id: req.params.id }); // Recommended way to delete

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ORDER API SERVICES
//Create New Order
app.post('/order/new', isAuthenticatedUser, async (req, res) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

//Get Single Order
app.get('/order/:id', isAuthenticatedUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: `Order not found with this ID: ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

//Get Loggedin User Orders
app.get('/myorders', isAuthenticatedUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////
//    ADMIN MANAGE ORDERS ROUTES

// Admin : Get All Orders
app.get('/orders', isAuthenticatedUser, authorizeRoles("admin"), async (req, res) => {
    try {
        const orders = await Order.find();

        let totalAmount = 0
        orders.forEach(order => {
            totalAmount += order.totalPrice
        })

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

//Admin : Update Order /Order Status (OrderStatus,DeliverdAt,Quantity,Stock)
app.put('/order/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        console.log(order)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: "Order has already been delivered!"
            });
        }

        // Updating the product stock of each ordered item
        order.orderItems.forEach(async orderItem => {
            await updateStock(orderItem.product, orderItem.quantity)
        })

        // Function to update product stock
        async function updateStock(productId, quantity) {
            const product = await Product.findById(productId);
            if (product) {
                product.stock = product.stock - quantity;
                await product.save({ validateBeforeSave: false });
            }
        }

        // Update order status and deliveredAt timestamp
        order.orderStatus = req.body.orderStatus;
        if (req.body.orderStatus === 'Delivered') {
            order.deliveredAt = Date.now();
        }
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order updated successfully!",
            order

        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

//Admin : Delete Order
app.delete('/order/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        await Order.deleteOne({ _id: req.params.id }); // Correct deletion method

        res.status(200).json({
            success: true,
            message: "Order successfully deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////// MANAGE REVIEWS
// Create Review
app.put('/review', isAuthenticatedUser, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const user = await User.findById(req.user.id); // ✅ Fetch user details

        const review = {
            user: req.user.id,
            name: req.user.name,  // ✅ Store the user's name
            rating,
            comment
        };

        // Check if user already reviewed the product
        const isReviewed = product.reviews.find(review => review.user.toString() === req.user.id.toString());

        if (isReviewed) {
            // Update existing review
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user.id.toString()) {
                    review.comment = comment;
                    review.rating = rating;
                }
            });
        } else {
            // Add new review
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        // Update average rating
        product.ratings = product.reviews.reduce((acc, review) => review.rating + acc, 0) / product.reviews.length;
        product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({ success: true });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

//Get Reviews
app.get('/reviews', async (req, res) => {
    try {
        const product = await Product.findById(req.query.id)
        res.status(200).json({
            success: true,
            reviews: product.reviews
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message
        })
    }
})

// Delete Review
app.delete('/review', async (req, res) => {
    try {
        const product = await Product.findById(req.query.productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Filter out the review to be deleted
        const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

        // Update number of reviews
        const numOfReviews = reviews.length;

        // Recalculate the average rating
        let ratings = reviews.reduce((acc, review) => {
            return review.rating + acc;
        }, 0) / reviews.length


        // Ensure ratings don't become NaN
        ratings = isNaN(ratings) ? 0 : ratings;

        // Update product in database
        await Product.findByIdAndUpdate(req.query.productId, {
            reviews,
            numOfReviews,
            ratings
        });

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

/////////////////////////////////////////////////////////////
//ADD TO CART

app.post('/cart/add', isAuthenticatedUser, async (req, res) => {
    let { productId, quantity } = req.body;
    const userId = req.user.id; // from isAuthenticatedUser

    // Ensure quantity is a number
    quantity = parseInt(quantity);
    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity.' });
    }

    try {
        const product = await Product.findById(productId);
        // console.log('product',product)
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        const user = await User.findById(userId);
        // console.log('user',user)
        if (!user) return res.status(404).json({ message: 'User not found.' });

        // Macth the product id return the product index position where userschema cart item index number
        const existingItemIndex = user.cartItems.findIndex(
            item => item.productId.toString() === productId
        );
        console.log('existingItemIndex',existingItemIndex)

        if (existingItemIndex > -1) {
            const existingQuantity = user.cartItems[existingItemIndex].quantity;
            const totalQuantity = existingQuantity + quantity;

            if (totalQuantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock - existingQuantity} more item(s) can be added to cart.`
                });
            }

            user.cartItems[existingItemIndex].quantity = totalQuantity;
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) available in stock.`
                });
            }

            user.cartItems.push({
                productId: product._id,
                quantity
            });
        }

        await user.save();
        res.status(200).json({ message: 'Item added to cart successfully.' });

    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});

// GET /cart - Get all cart items with populated product details
app.get('/cart', isAuthenticatedUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cartItems.productId');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const cartItems = user.cartItems.map(item => {
            const product = item.productId;

            // If product was deleted but still in cart
            if (!product) return null;

            return {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
                stock: product.stock,
                quantity: item.quantity
            };
        }).filter(Boolean); // remove null entries

        console.log('cartItems',cartItems)

        res.status(200).json({ cartItems });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});



app.post('/cart/update', isAuthenticatedUser, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity.' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} item(s) available.` });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const item = user.cartItems.find(item => item.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: 'Cart item not found.' });

        item.quantity = quantity;
        await user.save();

        res.status(200).json({ message: 'Cart updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});

app.post('/cart/remove', isAuthenticatedUser, async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.cartItems = user.cartItems.filter(
            item => item.productId.toString() !== productId
        );

        await user.save();
        res.status(200).json({ message: 'Item removed from cart.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});

app.post('/cart/apply-coupon', (req, res) => {
    const { code } = req.body;
    const coupons = {
        'SAVE1000': 2000,
        'DISCOUNT4000': 4000,
        'WELCOME500':500
    };

    if (coupons[code]) {
        return res.json({ valid: true, discountAmount: coupons[code] });
    } else {
        return res.json({ valid: false });
    }
});


// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // 1️⃣ Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Login first to access this resource."
            });
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3️⃣ Attach user to request object
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // 4️⃣ Pass control to next middleware
        next(); // ✅ Moves to the next middleware or route handler

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
            error: error.message
        });
    }
};

// ✅ Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource.`
            });
        }
        next();
    };
};

module.exports = { isAuthenticatedUser, authorizeRoles };

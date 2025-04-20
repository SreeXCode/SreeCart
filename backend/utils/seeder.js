const connectDatabase = require('../config/database'); // Import database connection function
const products_data = require('../data/products.json'); // Import product data (JSON file)
const Product = require('../models/productModel'); // Import Mongoose model for the "products" collection

connectDatabase(); // Call the database connection function

const seedProducts = async () => {
    try {
        // Deleting existing products
        await Product.deleteMany();
        console.log('Products deleted!');

        // Inserting new products
        await Product.insertMany(products_data);
        console.log('Products added!');
        process.exit(0); // Exit successfully
        
    } catch (error) {
        console.log('Error:', error.message); 
        process.exit(1); // Exit with failure   
    }
};

seedProducts();

const mongoose = require('mongoose')

const connectDatabase = ()=>{
    mongoose.connect("mongodb+srv://sree777:sree@cluster0.rhrbr.mongodb.net/SreeCart?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Successfully connected to MongoDB using Mongoose!"))
    .catch((err) => console.error("Connection error:", err));
}

module.exports = connectDatabase
// functions/utils/db.js

const mongoose = require('mongoose');

// Ulanish holatini kuzatish uchun global o'zgaruvchi
let cachedDb = null;

// Ma'lumotlar bazasiga ulanish funksiyasi
async function connectToDatabase() {
    // MongoDB Atlas Connection String Netlify Environment Variables orqali olinadi
    const DB_URI = process.MONGODB_URI;

    if (!DB_URI) {
        throw new Error('MONGODB_URI environment variable not set.');
    }

    if (cachedDb) {
        console.log('=> Cached connection used');
        return cachedDb;
    }

    try {
        const db = await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Serverless muhitda connection ni uzoq ushlab turmaslik uchun muhim
            serverSelectionTimeoutMS: 5000 
        });

        cachedDb = db;
        console.log('=> New connection established');
        return cachedDb;

    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Database connection failed.');
    }
}

module.exports = connectToDatabase;

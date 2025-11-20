// functions/api/test.js

const connectToDatabase = require('./db');
const Test = require('./models-Test');
const mongoose = require('mongoose');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await connectToDatabase();
        const data = JSON.parse(event.body);
        
        let query = {};
        if (data.code) {
            query.code = data.code;
        } else if (data.id) {
            // ID formatini tekshirish
            if (mongoose.Types.ObjectId.isValid(data.id)) {
                 query._id = data.id;
            } else {
                 return { statusCode: 404, body: JSON.stringify({ error: 'Invalid Test ID format.' }) };
            }
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Code or ID is required.' }) };
        }

        // Faqat kerakli maydonlarni qaytarish (javoblarni chiqarib tashlash)
        const test = await Test.findOne(query).select('-answers -results -__v');

        if (!test) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Test not found.' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(test)
        };
    } catch (error) {
        console.error('Fetch test error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch test.' }) };
    }
};

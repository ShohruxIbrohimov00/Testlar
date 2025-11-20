// functions/api/admin/tests.js

const connectToDatabase = require('./utils/db');
const Test = require('./models/Test');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await connectToDatabase();
        
        // Barcha testlarni (faqat asosiy ma'lumotlarni) olish
        const tests = await Test.find({})
            .select('name code questions _id')
            .sort({ createdAt: -1 }); // Eng yangilarini birinchi ko'rsatish

        return {
            statusCode: 200,
            body: JSON.stringify(tests)
        };
    } catch (error) {
        console.error('Fetch all tests error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch tests list.' }) };
    }
};

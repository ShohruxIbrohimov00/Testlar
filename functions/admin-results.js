// functions/api/admin/results.js

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
        const { testId } = JSON.parse(event.body);

        if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid Test ID.' }) };
        }

        // Testni topish va faqat Natijalar (results) va Savollar sonini olish
        const test = await Test.findById(testId).select('results questions');

        if (!test) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Test not found.' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                results: test.results,
                totalQuestions: test.questions 
            })
        };
    } catch (error) {
        console.error('Fetch results error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch results.' }) };
    }
};

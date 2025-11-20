// functions/api/create.js

const connectToDatabase = require('./db');
const Test = require('./models-Test');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // Serverless context ni qayta ishga tushirmaslik uchun
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await connectToDatabase();
        const testData = JSON.parse(event.body);
        
        // Yangi test yaratish
        const newTest = await Test.create(testData);

        return {
            statusCode: 201,
            body: JSON.stringify({ 
                id: newTest._id, 
                name: newTest.name, 
                code: newTest.code 
            })
        };
    } catch (error) {
        console.error('Test creation error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create test.' }) };
    }
};

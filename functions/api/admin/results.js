// functions/api/admin/results.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { testId } = JSON.parse(event.body);

        // 1. FaunaDB dan testni ID orqali olish
        const testRef = q.Ref(q.Collection('Tests'), testId);
        const testData = await client.query(
            q.Get(testRef)
        );
        
        // 2. Natijalar massivini olish
        const results = testData.data.results || [];
        const totalQuestions = testData.data.questions;

        // 3. Natijalarni front-endga qaytarish
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                results: results,
                totalQuestions: totalQuestions 
            }),
        };

    } catch (error) {
        console.error('Natijalarni olishda xato:', error);
        // Test topilmagan holatda ham bo'sh massiv qaytarish mumkin
        return {
            statusCode: 200, 
            body: JSON.stringify({ results: [], totalQuestions: 0 }),
        };
    }
};

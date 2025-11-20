// functions/api/create.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const testData = JSON.parse(event.body);

        // Test obyektini tayyorlash (IDni bazaning o'zi beradi)
        const newTest = {
            name: testData.name,
            pdf: testData.pdf, // Google Drive linki
            questions: testData.questions,
            variants: testData.variants,
            answers: testData.answers,
            code: testData.code,
            results: []
        };
        
        // FaunaDB ga saqlash
        const result = await client.query(
            q.Create(q.Collection('Tests'), { data: newTest })
        );

        // Front-endga bazadan olingan ID va boshqa ma'lumotlarni qaytarish
        return {
            statusCode: 200,
            body: JSON.stringify({ id: result.ref.id, ...result.data }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Test yaratishda xato.', details: error.message }),
        };
    }
};

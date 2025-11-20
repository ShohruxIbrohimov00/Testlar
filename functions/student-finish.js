// functions/api/student/finish.js

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
        const { testId, studentAnswers, userInfo } = JSON.parse(event.body);

        if (!testId || !mongoose.Types.ObjectId.isValid(testId) || !userInfo || !userInfo.id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid data provided.' }) };
        }

        // 1. Testni va uning to'g'ri javoblarini olish
        const test = await Test.findById(testId).select('answers questions results');

        if (!test) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Test not found.' }) };
        }

        // 2. Natijani hisoblash
        let correctCount = 0;
        const totalQuestions = test.questions;
        const correctAnswers = test.answers;

        for (let i = 1; i <= totalQuestions; i++) {
            const qNum = i.toString();
            const studentAns = studentAnswers[qNum];
            const correctAns = correctAnswers[qNum];

            if (!studentAns || !correctAns) continue;

            if (Array.isArray(correctAns)) {
                // Ko'p variantli javob
                const s = new Set(studentAns);
                const c = new Set(correctAns);
                // Ikkala to'plam teng bo'lsagina to'g'ri
                if (s.size === c.size && [...s].every(val => c.has(val))) {
                    correctCount++;
                }
            } else if (typeof correctAns === 'string') {
                // Yagona variantli yoki Matnli javob
                const sTrim = String(studentAns).trim().toLowerCase();
                const cTrim = String(correctAns).trim().toLowerCase();
                
                if (sTrim === cTrim) {
                    correctCount++;
                }
            }
        }

        const wrongCount = totalQuestions - correctCount;
        const percentage = parseFloat(((correctCount / totalQuestions) * 100).toFixed(1));

        // 3. Natijani DBga saqlash
        const resultEntry = {
            id: userInfo.id,
            name: userInfo.name,
            username: userInfo.username,
            correct: correctCount,
            wrong: wrongCount,
            total: totalQuestions,
            percentage: percentage,
            answers: studentAnswers,
            date: new Date()
        };
        
        // Agar o'quvchi bu testni avval ishlagan bo'lsa, uni o'chiramiz (yoki yangilaymiz)
        test.results = test.results.filter(r => r.id !== userInfo.id);
        
        test.results.push(resultEntry);
        await test.save();

        // 4. Talabaga natijani qaytarish
        return {
            statusCode: 200,
            body: JSON.stringify({
                correct: correctCount,
                wrong: wrongCount,
                percentage: percentage
            })
        };

    } catch (error) {
        console.error('Finish test error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Testni yakunlashda xato.' }) };
    }
};

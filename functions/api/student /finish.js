// functions/api/student/finish.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

// Savollarni tekshirish mantig'i (sizning kodingizdagi kabi)
function checkAnswer(correctAnswer, studentAnswer) {
    if (Array.isArray(correctAnswer)) {
        // Ko'p tanlovli savollar uchun
        const sortedCorrect = [...correctAnswer].sort();
        const sortedStudent = Array.isArray(studentAnswer) ? [...studentAnswer].sort() : [];
        return JSON.stringify(sortedCorrect) === JSON.stringify(sortedStudent);
    } else if (typeof correctAnswer === 'string' && correctAnswer.length > 5) {
        // Matnli javoblar uchun
        const c = correctAnswer.toLowerCase().trim();
        const s = (studentAnswer || '').toLowerCase().trim();
        return c === s;
    } else {
        // Yagona javobli savollar uchun
        return studentAnswer === correctAnswer;
    }
}


exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { testId, studentAnswers, userInfo } = JSON.parse(event.body);

        // 1. Bazadan testni topish va to'g'ri javoblarni olish
        const testRef = q.Ref(q.Collection('Tests'), testId);
        const testData = await client.query(q.Get(testRef));
        
        const correctAnswers = testData.data.answers;
        const totalQuestions = testData.data.questions;
        let correctCount = 0;

        // 2. Natijani serverda hisoblash (bu xavfsiz!)
        Object.keys(correctAnswers).forEach(qNum => {
            const correctAnswer = correctAnswers[qNum];
            const studentAnswer = studentAnswers[qNum];
            if (checkAnswer(correctAnswer, studentAnswer)) {
                correctCount++;
            }
        });
        
        const percentage = Math.round((correctCount / totalQuestions) * 100);

        // 3. Talaba natijasi obyektini yaratish
        const studentResult = {
            ...userInfo, // Name, Username, Date kabi ma'lumotlar
            answers: studentAnswers, // Talabaning javoblarini ham saqlaymiz
            correct: correctCount,
            total: totalQuestions,
            percentage: percentage,
            date: new Date().toISOString()
        };

        // 4. Testning natijalar massivini yangilash (natijani saqlash)
        await client.query(
            q.Update(testRef, {
                data: {
                    results: q.Append(studentResult, q.Select(['data', 'results'], q.Get(testRef)))
                }
            })
        );

        // 5. Hisoblangan natijani front-endga qaytarish
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                correct: correctCount, 
                wrong: totalQuestions - correctCount, 
                total: totalQuestions,
                percentage: percentage 
            }),
        };

    } catch (error) {
        console.error('Natijani hisoblashda xato:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Natijani saqlashda jiddiy xato yuz berdi.', details: error.message }),
        };
    }
};

// functions/api/auth.js

exports.handler = async (event, context) => {
    // Netlify'dagi maxfiy o'zgaruvchidan admin ID ni olamiz
    const ADMIN_TELEGRAM_ID = process.ADMIN_TELEGRAM_ID;

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { telegramId } = data; // Front-end dan kelgan talaba ID
        
        // Front-end dan kelgan ID bilan Netlify'dagi ADMIN ID ni solishtirish
        const isAdmin = telegramId === ADMIN_TELEGRAM_ID;

        return {
            statusCode: 200,
            body: JSON.stringify({ isAdmin: isAdmin })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Authentication check failed.' }) };
    }
};

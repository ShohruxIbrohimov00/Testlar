// functions/api/auth.js
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { telegramId } = JSON.parse(event.body);
        
        // Netlify muhit o'zgaruvchisidan haqiqiy admin ID ni olish
        const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID; 

        // Tekshirish: Agar kirish qilingan ID va saqlangan ID mos kelsa
        if (telegramId === ADMIN_ID) {
            return {
                statusCode: 200,
                body: JSON.stringify({ isAdmin: true, message: "Admin ruxsati berildi." }),
            };
        } else {
            return {
                statusCode: 200, // 403 o'rniga 200 berish, foydalanuvchini chalg'itmaslik uchun
                body: JSON.stringify({ isAdmin: false, message: "Siz admin emassiz." }),
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Avtorizatsiyada xato.', details: error.message }),
        };
    }
};

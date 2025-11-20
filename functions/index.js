// functions/index.js

// Bu fayl Netlify Functions papkasini Node.js muhiti sifatida tan olishi uchun yordamchi hisoblanadi.
// Bizning haqiqiy API funksiyalarimiz functions/api/ ichida joylashgan.
exports.handler = async (event, context) => {
    // Agar kimdir to'g'ridan-to'g'ri functions/index.js ni chaqirsa, xato xabari qaytariladi
    return {
        statusCode: 404,
        body: JSON.stringify({ message: "Not Found. Use specific API endpoints, e.g., /.netlify/functions/api/auth" })
    };
};

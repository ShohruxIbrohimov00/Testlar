// functions/api/admin/tests.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // FaunaDB da barcha 'Tests' ni topish
        const result = await client.query(
            q.Map(
                q.Paginate(q.Match(q.Index('all_tests'))), // 'all_tests' indeksini yaratish kerak!
                q.Lambda('ref', q.Get(q.Var('ref')))
            )
        );

        // Faqat kerakli maydonlarni ajratib olish
        const tests = result.data.map(item => ({
            id: item.ref.id,
            name: item.data.name,
            code: item.data.code,
            questions: item.data.questions // Savollar sonini ko'rsatish uchun
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(tests),
        };

    } catch (error) {
        // Agar baza bo'sh bo'lsa yoki xato bo'lsa, bo'sh massiv qaytaramiz
        return {
            statusCode: 200, 
            body: JSON.stringify([]),
        };
    }
};

// functions/api/result.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { testId, userInfo } = JSON.parse(event.body);
        
        // FaunaDB da testni topish va natijalarni yangilash
        // Bu mantiq ancha murakkab, chunki u natijalarni to'g'ri qo'shishi kerak.
        
        const result = await client.query(
            q.Update(
                q.Ref(q.Collection('Tests'), testId), // ID orqali testni topish
                {
                    data: {
                        results: q.Append(userInfo, q.Select(['data', 'results'], q.Get(q.Ref(q.Collection('Tests'), testId))))
                    }
                }
            )
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Natija saqlandi.', result: result.data }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Natijani saqlashda xato.', details: error.message }),
        };
    }
};

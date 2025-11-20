// functions/api/test.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { code, id } = JSON.parse(event.body);
    let result;

    if (code) {
        // 1. Kod orqali qidirish
        result = await client.query(
            q.Get(
                q.Match(q.Index('test_by_code'), code) 
            )
        );
    } else if (id) {
        // 2. ID orqali qidirish
        result = await client.query(
            q.Get(q.Ref(q.Collection('Tests'), id)) 
        );
    } else {
        return { statusCode: 400, body: JSON.stringify({ message: 'Kod yoki ID kiritilmadi.' }) };
    }

    // Front-endga testni qaytarish (ref.id ni ham qo'shamiz)
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.ref.id, ...result.data }),
    };

  } catch (error) {
    console.error('Testni olishda xato:', error);
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Test topilmadi.' }),
    };
  }
};

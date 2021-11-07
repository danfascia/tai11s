const fetch = require("node-fetch");

const API_ENDPOINT = 'https://api.netlify.com/build_hooks/61883da143db9fcf939555f6';

exports.handler = async (event, context) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
    });
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify({ data }) };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
  }
};
          
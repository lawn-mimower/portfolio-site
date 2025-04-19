// netlify/functions/chat.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Your portfolio context (unchanged)
const portfolioContext = `…`;  // (same as before)

exports.handler = async (event) => {
  // 1) CORS headers (including preflight)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // 2) Validate input
    const { text } = JSON.parse(event.body || '{}');
    if (!text || typeof text !== 'string') {
      throw new Error("Invalid 'text' field in request body.");
    }

    // 3) Build the full prompt
    const fullPrompt = `
${portfolioContext}

**User Question:**
${text}

**Answer:**`;

    // 4) Initialize the SDK with your API key (set in Netlify UI)
    const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

    // 5) Pick your model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'   // or your chosen variant
    });

    // 6) CORRECT generateContent call: wrap prompt in an array :contentReference[oaicite:0]{index=0}
    const result = await model.generateContent([fullPrompt]);

    // 7) Extract the text reply properly
    const reply = result.response?.text?.();
    if (!reply) {
      throw new Error('Empty response from AI model.');
    }

    // 8) Return the AI’s answer
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Chat function error:', err);
    const code = err.message.includes('Invalid') ? 400 : 500;
    return {
      statusCode: code,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};

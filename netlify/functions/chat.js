// netlify/functions/chat.js
const genai = require('@google/generative-ai');

exports.handler = async function(event) {
  try {
    const { text } = JSON.parse(event.body);

    // Initialize the client with ADC (set via Netlify env)
    const client = new genai.Client({
      project:   process.env.VERTEXAI_PROJECT_ID,
      location:  process.env.VERTEXAI_LOCATION,
      vertexai:  true
      // no apiKey here—uses ADC from Netlify env
    });

    const result = await client.models.generateContent({
      model:    'gemini-2.0-flash-exp',
      contents: [{ text }]
    });

    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text
      || result.text
      || '🤖 (no reply)';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

// netlify/functions/chat.js
const genai = require('@google/generative-ai');

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    // Initialize the Vertex AI client using Netlify environment vars
    const client = new genai.Client({
      project:  process.env.VERTEXAI_PROJECT_ID,
      location: process.env.VERTEXAI_LOCATION,
      vertexai: true
      // NO apiKey here—use ADC in Netlify UI under Build & deploy → Environment
    });

    const result = await client.models.generateContent({
      model:    'gemini-2.0-flash',
      contents: [{ text }]
    });

    // Extract the reply text
    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text
      || result.text
      || '🤖 (no response)';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Chat function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

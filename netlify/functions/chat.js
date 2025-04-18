// netlify/functions/chat.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- START: Define Your Portfolio Context ---
// This is the information the AI will use to answer questions.
// Keep it concise and factual, based on your index.html content.
const portfolioContext = `
You are a helpful AI assistant for Mihr Mohite's portfolio website.
Your goal is to answer questions about Mihr based *only* on the information provided below.
Be friendly, concise, and informative. If the question is unrelated to Mihr's portfolio or the provided context, politely state that you can only answer questions about Mihr's profile.

**Mihr Mohite's Profile:**

* **Name:** Mihr Mohite
* **Focus:** AIML (Artificial Intelligence & Machine Learning) & Physics Enthusiast, Developer.
* **Education:** Student at MIT-WPU (inferred).
* **Current Positions:**
    * Vice Technical Head, CoDeC (Official Competitive Programming Club of MIT-WPU). Responsibilities include co-leading technical activities, strategy, and mentoring.
    * ML Projects Division Lead, CoDeC (MIT-WPU). Responsibilities include guiding ML projects and fostering ML learning.
* **Key Skills:**
    * AI/ML: Python, TensorFlow, Keras, PyTorch, Scikit-learn, MLP, Deep Learning.
    * Software/Simulation: MATLAB, C++, C, Python, Git, GitHub, SLAM, FFT.
    * Hardware/IoT: Arduino, ESP32/8266, Raspberry Pi, LiDAR, LoRa, Various Sensors, Embedded C.
    * Web Dev (Basic): HTML, CSS, JavaScript.
* **Featured Projects:**
    * Scout Rover: Navigates dangerous areas using LiDAR-based SLAM (MATLAB), environmental sensors (Temp, Humidity, Ultrasonic, MQ5). (Category: IoT, AIML, Robotics)
    * Electric Load Forecasting: MLP Deep Learning model for Delhi's electricity demand. (Category: AIML, Software)
    * LDR Solar Tracker: Uses LDRs to orient solar panels towards the sun. (Category: IoT, Hardware)
    * SOS Tracker: LoRa (433 MHz FM) based emergency signaling device. (Category: IoT, Hardware)
    * LiDAR Fan Speed Detector: Measures fan speed non-contactually using LiDAR and MATLAB FFT. (Category: Software, AIML, IoT)
    * University Feedback System: (In Progress) Web-based system for university feedback. (Category: Software, Web)
* **Achievements:**
    * SIH (Smart India Hackathon) Round 2 Qualifier.
    * Runner-up at Circuit Heist.
    * Round 3 Qualifier at Dataquest.
    * HackMITWPU participation/achievement (clarify specific outcome if known).
* **Interests:** Exploring physics concepts, contributing to open source, reading tech blogs (examples, replace with actual).
* **Location:** Pune, Maharashtra, India.
`;
// --- END: Define Your Portfolio Context ---


exports.handler = async (event) => {
  // Allow POST requests. Handle OPTIONS preflight request for CORS.
  const headers = {
    'Access-Control-Allow-Origin': '*', // Or replace * with your Netlify site URL for better security
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers,
      body: ''
    };
  }

  // Only allow POST method for actual chat requests
  if (event.httpMethod !== 'POST') {
    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }


  try {
    // Ensure body exists and is valid JSON
    if (!event.body) {
        throw new Error("Request body is missing.");
    }
    let parsedBody;
    try {
        parsedBody = JSON.parse(event.body);
    } catch (e) {
        throw new Error("Invalid JSON in request body.");
    }

    const { text } = parsedBody;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error("Invalid 'text' field in request body.");
    }

    const userQuestion = text;

    // --- Combine Context with User Question ---
    const fullPrompt = `${portfolioContext}\n\n**User Question:**\n${userQuestion}\n\n**Answer:**`;

    // Initialize with API key from environment variables
    const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

    // Choose the appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your preferred model

    // --- Generate Content with Context ---
    console.log("Sending prompt to Gemini:", fullPrompt); // Log the prompt for debugging (optional)
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    if (!response || !response.text) {
        // Handle cases where the API might return an empty response or error structure
        console.error('Gemini API response missing text. Response:', response);
        throw new Error("Received an empty or invalid response from the AI model.");
    }

    const reply = response.text();
    console.log("Received reply from Gemini:", reply); // Log the reply for debugging (optional)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Chat function error:', err);
    // Provide a more structured error response
    const errorMessage = err.message || "An internal server error occurred.";
    const statusCode = err.message.includes("Invalid") ? 400 : 500; // Bad Request for invalid input

    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
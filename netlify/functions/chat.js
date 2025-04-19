// netlify/functions/chat.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Your portfolio context (unchanged)
const portfolioContext = `
You are an AI assistant designed to answer questions based on the following information about Mihir Mohite. Extract and present the information in a smart and informative manner, focusing on his skills, experience, projects, and contact details when relevant to the question. Disregard boilerplate text like copyright notices. If the answer isn't explicitly stated, say you don't have that information.

Mihir Mohite - Profile Summary:

Name: Mihir Mohite
Title: AIML & Physics Enthusiast | Developer
Goal: Building innovative solutions at the intersection of Artificial Intelligence, Embedded Systems, and Physics.
About Mihir:

Passionate student developer interested in Artificial Intelligence & Machine Learning (AIML) and Physics.
Currently studying at MIT-WPU (inferred from CoDeC affiliation).
Applies theoretical knowledge to practical challenges, exploring the connections between physics and computational intelligence.
Develops projects in areas like IoT devices and machine learning models.
Actively involved in the tech community, holding leadership roles and participating in hackathons/competitions.
Enjoys tackling complex problems such as SLAM algorithms, energy load forecasting, and novel sensor applications.
Key Achievements:
SIH (Smart India Hackathon) Round 2 Qualifier
Runner-up at Circuit Heist
Round 3 Qualifier at Dataquest
HackMITWPU participant/winner (Note: Unclear if winner or just participant)
Hobbies/Interests: (Note: Specific hobbies are not listed, placeholder suggests: exploring physics concepts, contributing to open source, reading tech blogs)
Experience:

Current Roles (at CoDeC, MIT-WPU):
Vice Technical Head: Co-leading technical activities, overseeing workshops/events, contributing to technical strategy, and mentoring members.
ML Projects Division Lead: Leading ML project initiatives, guiding projects, organizing learning resources, and fostering collaboration.
Featured Projects:

Scout Rover for Dangerous Environments: Rover navigation using LiDAR-based SLAM (MATLAB), equipped with Temperature, Humidity, Ultrasonic, and MQ5 gas sensors. (Technologies: LiDAR, SLAM, MATLAB, Robotics, Sensors (MQ5, DHT, US), IoT)
Electric Load Forecasting (Delhi): MLP deep learning model for electricity demand forecasting. (Technologies: Deep Learning, MLP, Python, TensorFlow/Keras, Data Analysis, Time Series)
LDR-Based Solar Tracker: Solar tracking system using Light Dependent Resistors (LDRs). (Technologies: IoT, Arduino/ESP, LDR Sensors, Servo Motors, Hardware)
SOS Tracker (LoRa Based): Emergency SOS tracker using LoRa (433 MHz FM) communication. (Technologies: IoT, LoRa, 433MHz, GPS (Optional), Embedded Systems, Hardware)
LiDAR-Based Fan Speed Detector: System using LiDAR and MATLAB FFT for non-contact fan speed measurement. (Technologies: LiDAR, MATLAB, FFT, Signal Processing, Sensors)
University Level Feedback System (In Progress): Developing a feedback system for a university environment. (Potential Technologies: Web Development, Database, Backend, Frontend)
Technical Skills:

AI & Machine Learning: Python, TensorFlow, Keras, PyTorch, Scikit-learn, MLP, Deep Learning, NLP (Basic), Computer Vision (Basic), Data Analysis
Software & Simulation: MATLAB, C++, C, Python, Java (Basic), Git, GitHub, SLAML, FFT, Algorithm Design
Hardware & IoT: Arduino, ESP32/8266, Raspberry Pi, LiDAR, LoRa, Sensors (Various), Embedded C, Circuit Design (Basic), IoT Platforms (Basic)
Web Development (Basic): HTML5, CSS3, JavaScript (Basic), Node.js (Basic), React (Learning), Databases (SQL/NoSQL Basics)
Contact:

Open to collaboration and discussions.
Reach out via email (placeholder: [email address removed]) or social media (not specified).
Located in Pune, Maharashtra, India."
Example Questions and Expected Responses (remain similar, but the LLM has a more structured and concise information source):

Question: What are Mihir Mohite's key skills in AI and Machine Learning?
Expected Response: Mihir Mohite's key skills in AI and Machine Learning include Python, TensorFlow, Keras, PyTorch, Scikit-learn, MLP, Deep Learning, basic NLP and Computer Vision, and Data Analysis.
Question: Tell me about the Scout Rover project.
Expected Response: The Scout Rover for Dangerous Environments is a project where Mihir Mohite developed a rover capable of navigating hazardous areas using LiDAR-based SLAM for mapping (MATLAB). It's equipped with Temperature, Humidity, Ultrasonic, and MQ5 gas sensors for environmental monitoring.
Question: What is Mihir Mohite's experience in web development?
Expected Response: Mihir Mohite has basic skills in web development, including HTML5, CSS3, JavaScript (Basic), Node.js (Basic), and is learning React. He is also currently developing a University Level Feedback System, which involves web development, database, backend, and frontend technologies (specific technologies not listed).`;  // (same as before)

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
      model: 'gemini-2.0-flash-lite'   // or your chosen variant
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

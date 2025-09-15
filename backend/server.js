// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: "Server is running!" });
});
const axios = require('axios');
async function askGeminiAI(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: promptText }] }]
    });
    // This may need to be adjusted based on latest Gemini API response format:
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (err) {
    console.error("Gemini API error:", err?.response?.data || err.message);
    return "Error contacting Gemini AI";
  }
}

app.post('/ask-gemini', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt is required" });

  const aiResponse = await askGeminiAI(prompt);
  res.json({ response: aiResponse });
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.json({ message: "User registered!" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      res.json({ message: "Login successful!" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Get-question endpoint (generate question using Gemini AI)
app.get('/get-question', async (req, res) => {
  // You can customize the prompt for your needs:
  const prompt = "Generate a multiple-choice math question for a beginner student. Format: {\"question\": \"...\", \"options\": [\"...\", \"...\", \"...\", \"...\"], \"answer\": \"...\"}";

  const aiText = await askGeminiAI(prompt);

  // Try to parse as JSON if Gemini follows the format, else return as text
  try {
    const questionObj = JSON.parse(aiText);
    res.json(questionObj);
  } catch {
    res.json({ question: aiText });
  }
});

// Submit-answer endpoint (store score)
app.post('/submit-answer', async (req, res) => {
  const { username, score } = req.body;
  try {
    const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const userId = users[0].id;
    await db.query('INSERT INTO scores (user_id, score) VALUES (?, ?)', [userId, score]);
    res.json({ message: "Score submitted!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit score", error: err.message });
  }
});

// Leaderboard endpoint (top 10 scores)
app.get('/leaderboard', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT users.username, MAX(scores.score) as top_score
       FROM scores
       JOIN users ON scores.user_id = users.id
       GROUP BY users.username
       ORDER BY top_score DESC
       LIMIT 10`
    );
    res.json({ leaderboard: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to get leaderboard", error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

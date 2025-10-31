const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Check if Gemini API key is configured
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not found in environment variables. AI Assistant will not work.');
}

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if Gemini AI is configured
    if (!genAI) {
      return res.status(503).json({ 
        error: 'AI Assistant is not configured. Please add GEMINI_API_KEY to your environment variables.' 
      });
    }

    // Get the Gemini model - using gemini-1.5-flash for better performance
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create conversation context for the AI
    const systemPrompt = `You are a helpful and friendly AI assistant for a developer's portfolio website. 
The developer is showcasing their projects, skills, and experience. Help visitors by:
- Answering questions about the developer's skills and experience
- Explaining projects and technologies used
- Providing guidance on navigating the portfolio
- Being concise, helpful, and professional
- If asked about something not on the portfolio, politely redirect to contact the developer directly

Keep responses brief, conversational, and user-friendly.`;

    // Build the chat history
    const chatHistory = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Hello! I\'m your portfolio AI assistant. How can I help you today?' }] }
    ];

    // Add previous conversation history if available
    if (conversationHistory.length > 0) {
      conversationHistory.slice(-10).forEach(msg => {
        chatHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Start chat session
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send the message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      message: text,
      success: true
    });

  } catch (error) {
    console.error('Gemini AI Error:', error);
    console.error('Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Failed to get AI response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      hint: 'Check your GEMINI_API_KEY and ensure it is valid'
    });
  }
});

module.exports = router;


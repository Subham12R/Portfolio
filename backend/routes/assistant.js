const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3-8b-instruct';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY not found in environment variables');
}

// System prompt with portfolio information
const SYSTEM_PROMPT = `You are Subham's Portfolio Assistant. You help visitors learn about Subham Karmakar, a Full Stack Web Developer.

About Subham:
- Name: Subham Karmakar
- Title: Full Stack Web Developer
- Education: B.Tech CSE Student at Adamas University, Kolkata, India
- Location: India
- Email: rikk4335@gmail.com
- GitHub: https://github.com/Subham12R
- LinkedIn: https://www.linkedin.com/in/subham-karmakar-663b1031b/
- Twitter: https://twitter.com/Subham12R

Technologies & Skills:
- Frontend: React, Next.js, TailwindCSS, JavaScript, TypeScript
- Backend: Node.js, Express, NestJS
- Databases: PostgreSQL, MongoDB
- Tools: Git, Docker, AWS, Vercel, Figma
- Currently learning: Three.js, UI/UX Design

Your role:
- Answer questions about Subham's work, experience, projects, and skills
- Be friendly, professional, and concise
- If asked about specific projects or work experience, mention that details are available on the portfolio
- For contact information, direct them to use the contact form or email
- Keep responses brief and helpful (2-3 sentences max when possible)

Remember: You're representing Subham professionally. Be helpful and informative.`;

// Helper function to sanitize input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

// Helper function to validate conversation history
function validateConversationHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(msg => msg && typeof msg === 'object' && 
            (msg.role === 'user' || msg.role === 'assistant') &&
            typeof msg.content === 'string')
    .map(msg => ({
      role: msg.role,
      content: sanitizeInput(msg.content)
    }))
    .filter(msg => msg.content.length > 0);
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    // Check if API key is available
    if (!OPENROUTER_API_KEY) {
      return res.status(503).json({ 
        error: 'Assistant service is not available. Please configure OPENROUTER_API_KEY.' 
      });
    }

    const { message, conversationHistory = [] } = req.body;

    // Validate and sanitize message
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Validate and sanitize conversation history
    const validatedHistory = validateConversationHistory(conversationHistory);

    // Build messages array for OpenRouter
    const messages = [];

    // Add system prompt as first message
    messages.push({
      role: 'system',
      content: SYSTEM_PROMPT
    });

    // Add greeting from assistant
    messages.push({
      role: 'assistant',
      content: "Hello! I'm Subham's Portfolio Assistant. How can I help you learn about Subham's work and experience?"
    });

    // Add conversation history (excluding the initial greeting if present)
    validatedHistory.forEach(msg => {
      // Skip the initial greeting if it's in history
      if (msg.role === 'assistant' && 
          msg.content.includes("Hello! I'm Subham's Portfolio Assistant")) {
        return;
      }
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: sanitizedMessage
    });

    // Make request to OpenRouter
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: messages
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'Subham Portfolio Assistant',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract assistant reply
    const assistantReply = response.data?.choices?.[0]?.message?.content;

    if (!assistantReply) {
      throw new Error('No response from OpenRouter API');
    }

    res.json({
      success: true,
      message: assistantReply.trim()
    });

  } catch (error) {
    console.error('Assistant chat error:', error);

    // Handle axios errors
    if (error.response) {
      // OpenRouter API returned an error
      return res.status(500).json({ 
        error: 'Failed to get response from assistant',
        details: process.env.NODE_ENV === 'development' 
          ? error.response.data?.error?.message || error.message 
          : undefined
      });
    }

    if (error.request) {
      // Request was made but no response received
      return res.status(500).json({ 
        error: 'Assistant service is temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? 'Network timeout or connection error' : undefined
      });
    }

    // Other errors
    res.status(500).json({ 
      error: 'Failed to get response from assistant',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

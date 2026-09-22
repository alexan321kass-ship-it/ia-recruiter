const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

openai.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: 'You are a recruiter bot. Always reply in JSON.' },
    { role: 'user', content: 'Analyze this candidate: John, 5 years of experience in marketing. Reply with: { "role": "", "summary": "", "strengths": [], "technicalSkills": [] }' }
  ],
  response_format: { type: 'json_object' }
}).then(res => {
  console.log('✅ GROQ FUNCIONA CORRECTAMENTE');
  console.log(res.choices[0].message.content);
}).catch(err => {
  console.log('❌ ERROR:', err.error || err.message || err);
});

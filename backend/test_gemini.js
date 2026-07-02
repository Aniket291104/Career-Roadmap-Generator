const { GoogleGenAI } = require('@google/genai');

const apiKey = 'AQ.Ab8RN6IvjNlMtBCy_7nxmAEmtd8RXdoWXOaP-3J9QnJCijMHqQ';

async function main() {
  try {
    console.log('Testing Gemini API key...');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, respond with a short message.',
    });
    console.log('Gemini API key is working! Response:', response.text);
  } catch (error) {
    console.error('Gemini API test failed:', error.message || error);
  }
}

main();

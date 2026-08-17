// Quick test of OpenAI API key
const fs = await import('fs');
const env = fs.default.readFileSync('.env.local', 'utf8');
const key = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();

console.log('Key found:', !!key);
console.log('Key preview:', key?.slice(0, 20) + '...');

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Say: OK' }
    ],
    max_tokens: 10,
  }),
});

const data = await res.json();
if (data.error) {
  console.error('❌ OpenAI Error:', data.error.message);
} else {
  console.log('✅ OpenAI API working! Response:', data.choices?.[0]?.message?.content);
}

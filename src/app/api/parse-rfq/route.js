import OpenAI from 'openai';

export async function POST(req) {
  // Lazy-init inside handler so build doesn't fail without OPENAI_API_KEY
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 3) {
      return Response.json({ error: 'Input too short' }, { status: 400 });
    }

    const systemPrompt = `You are a steel procurement assistant for an Indian steel trading platform.
Extract steel product requirements from the user's text (WhatsApp message, typed list, or informal note).

IMPORTANT: You MUST respond with ONLY a JSON object in this exact format:
{
  "items": [
    {
      "product": "TMT Bars",
      "size": "12mm",
      "quantity": 200,
      "unit": "Nos",
      "estimatedTons": 1.78,
      "notes": ""
    }
  ]
}

Product name rules — use EXACTLY one of these names:
TMT Bars, MS Pipes, GP Pipes, MS Flat, MS Square Rods, MS Angle, MS Beams, MS Channels, Binding Wire, MS Sheets, GI Sheets, GI Pipes, Roofing Sheets, Welding Rods

Unit conversion rules:
- TMT 12mm: 1 nos = 0.00889 tons. So 200 nos = 1.778 tons
- TMT 8mm: 1 nos = 0.00474 tons
- TMT 16mm: 1 nos = 0.01896 tons
- If unit is already tons/kg, convert directly (1000kg = 1 ton)
- If unclear, estimate and note it

Rules:
- If user mentions "NB" or "inch" for pipes, it is an MS Pipe or GP Pipe size
- "25 NB" or "1 inch" = pipe size
- Ignore greetings, addresses, phone numbers
- If no steel products found, return { "items": [] }
- DO NOT return anything except the JSON object`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content?.trim() || '';
    console.log('OpenAI raw response:', raw);

    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      const obj = JSON.parse(cleaned);
      // Handle both { items: [...] } and bare array
      if (Array.isArray(obj)) {
        parsed = obj;
      } else if (obj.items && Array.isArray(obj.items)) {
        parsed = obj.items;
      } else {
        // Try to find any array in the object
        const firstArray = Object.values(obj).find(v => Array.isArray(v));
        parsed = firstArray || [];
      }
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw:', cleaned);
      return Response.json({ error: 'Failed to parse AI response', raw: cleaned }, { status: 500 });
    }

    return Response.json({ items: parsed });

  } catch (err) {
    console.error('parse-rfq error:', err);
    // Check for common OpenAI errors
    if (err?.status === 401) {
      return Response.json({ error: 'Invalid OpenAI API key' }, { status: 500 });
    }
    if (err?.status === 429) {
      return Response.json({ error: 'OpenAI rate limit reached. Please try again in a moment.' }, { status: 500 });
    }
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

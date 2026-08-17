import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 3) {
      return Response.json({ error: 'Input too short' }, { status: 400 });
    }

    const systemPrompt = `You are a steel procurement assistant for an Indian steel trading platform. 
Extract steel product requirements from the user's text (which may be a WhatsApp message, handwritten note, or informal list).

Return ONLY a valid JSON array of items. Each item must have:
- "product": string (e.g., "TMT Bars", "MS Pipes", "MS Angle", "GI Sheets", "MS Beams", "MS Channels", "Binding Wire")
- "size": string (e.g., "12mm", "25 NB", "75x50mm", "20 Gauge")  
- "quantity": number
- "unit": string (e.g., "Nos", "Ton", "Kg", "Boxes", "Bundles", "Feet")
- "estimatedTons": number (convert to approximate tons; for "nos" use weight estimates)
- "notes": string (any special requirements, brand preferences, grade etc.)

Rules:
- "100 nos" of 12mm TMT = approx 1.07 tons (12 × 0.889 kg each)
- "100 nos" of 8mm TMT = approx 0.474 tons
- If unit is already tons/kg, convert directly
- If unclear, make your best estimate and note it
- Ignore greetings, addresses, phone numbers
- Return [] if no steel products found

Example output:
[{"product":"TMT Bars","size":"12mm","quantity":200,"unit":"Nos","estimatedTons":1.778,"notes":"Fe 500D grade, TATA preferred"},{"product":"MS Pipes","size":"25 NB","quantity":50,"unit":"Nos","estimatedTons":0.3,"notes":""}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    let parsed;
    try {
      const raw = completion.choices[0].message.content;
      const obj = JSON.parse(raw);
      // GPT might wrap in { items: [...] } or return array directly
      parsed = Array.isArray(obj) ? obj : (obj.items || obj.results || obj.products || []);
    } catch {
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return Response.json({ items: parsed });
  } catch (err) {
    console.error('parse-rfq error:', err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

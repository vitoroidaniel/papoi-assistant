const router = require('express').Router();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'GROK_API_KEY not set. Go to ⚙️ Settings and add your key.' });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          {
            role: 'system',
            content: 'You are Paopoi, a witty and helpful AI assistant. Your name comes from the Minions universe. Be concise, friendly, and smart. Format code in markdown code blocks.'
          },
          ...messages
        ],
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Grok API error: ${err}` });
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

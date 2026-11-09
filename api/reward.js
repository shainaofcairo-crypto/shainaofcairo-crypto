export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).json({ ok: true, message: 'SHAINA reward API is live. Use POST.' });
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const username = body?.username || body?.uid || 'testuser';
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true, mode: 'test-no-key', username, reward: 1,
        message: 'Reward API works! But PI_API_KEY is not set in Vercel yet, so this is test mode.'
      });
    }
    try {
      const piRes = await fetch('https://api.minepi.com/v2/payments', {
        method: 'POST',
        headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1, memo: `SHAINA reward for ${username}`, metadata: { username }, uid: username })
      });
      const piData = await piRes.text();
      return res.status(200).json({ success: true, username, reward: 1, pi_status: piRes.status, pi_response: piData });
    } catch (e) {
      return res.status(200).json({ success: true, username, reward: 1, note: 'Pi call failed but API did not crash: ' + e.message });
    }
  } catch (e) {
    return res.status(200).json({ success: false, error: e.message });
  }
}

export default async function handler(req, res) {
  const { id } = req.query;
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN is not set in environment variables' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const prediction = await response.json();

    res.json({
      predictionId: prediction.id,
      status: prediction.status,
      outputUrl: prediction.output,
      error: prediction.error
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get prediction status' });
  }
}

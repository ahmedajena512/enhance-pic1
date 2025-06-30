export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN is not set in environment variables' });
  }

  try {
    const { image, scale = 4, face_enhance = false } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        version: "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
        input: {
          image: image,
          scale: Number(scale),
          face_enhance: Boolean(face_enhance)
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('greater than the max size that fits in GPU memory')) {
        return res.status(400).json({ 
          error: 'Image too large for processing. Please use a smaller image (recommended: under 1000x1000 pixels).' 
        });
      }
      return res.status(response.status).json({ error: 'Failed to enhance image. Please try again.' });
    }

    const result = await response.json();
    res.json({
      predictionId: result.id,
      status: result.status,
      outputUrl: result.output
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to enhance image' });
  }
} 

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Get Replicate API token from environment
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN is not set in environment variables');
  console.error('Please set your Replicate API token in the environment');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://rtrf4u8qhg.space.minimax.io'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// API Routes
app.post('/api/enhance', async (req, res) => {
  try {
    const { image, scale = 4, face_enhance = false } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    console.log('Creating prediction with scale:', scale, 'face_enhance:', face_enhance);

    // Call Replicate API directly with proper headers
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait' // This makes the API wait for completion
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
      console.error('Replicate API error:', errorText);
      
      // Check for specific error types
      if (errorText.includes('greater than the max size that fits in GPU memory')) {
        return res.status(400).json({ 
          error: 'Image too large for processing. Please use a smaller image (recommended: under 1000x1000 pixels).' 
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to enhance image. Please try again.' 
      });
    }

    const result = await response.json();
    
    res.json({
      predictionId: result.id,
      status: result.status,
      outputUrl: result.output
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to enhance image' 
    });
  }
});

app.get('/api/prediction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
    console.error('Prediction status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get prediction status' 
    });
  }
});

app.post('/api/prediction/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    res.json({ message: 'Prediction canceled successfully' });

  } catch (error) {
    console.error('Cancel prediction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to cancel prediction' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    replicateConfigured: !!REPLICATE_API_TOKEN
  });
});

// Fallback to serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🔑 Replicate API: ${REPLICATE_API_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
});

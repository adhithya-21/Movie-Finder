const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes (to support running front-end and back-end on different ports)
app.use(cors());

// Serve static frontend assets from the root directory
app.use(express.static(__dirname));

/**
 * Health check / Status endpoint
 * Lets the frontend check if the backend is available and has a valid API key configured.
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.OMDB_API_KEY && process.env.OMDB_API_KEY !== 'your_omdb_api_key_here'
  });
});

/**
 * Movie Proxy endpoint
 * Forwards calls to OMDb API without revealing the API Key to the client.
 */
app.get('/api/movies', async (req, res) => {
  const { s, t, i, plot } = req.query;
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey || apiKey === 'your_omdb_api_key_here') {
    return res.status(500).json({ 
      Response: 'False', 
      Error: 'OMDb API Key is not configured on the backend server. Please add it to your .env file.' 
    });
  }

  // Construct the OMDb URL depending on parameters supplied
  let omdbUrl = `https://www.omdbapi.com/?apikey=${apiKey}`;
  
  if (s) {
    omdbUrl += `&s=${encodeURIComponent(s)}&type=movie`;
  } else if (t) {
    omdbUrl += `&t=${encodeURIComponent(t)}`;
    if (plot) omdbUrl += `&plot=${encodeURIComponent(plot)}`;
  } else if (i) {
    omdbUrl += `&i=${encodeURIComponent(i)}`;
    if (plot) omdbUrl += `&plot=${encodeURIComponent(plot)}`;
  } else {
    return res.status(400).json({ 
      Response: 'False', 
      Error: 'Invalid search parameters. Provide a search query (s), title (t), or IMDb ID (i).' 
    });
  }

  try {
    const response = await fetch(omdbUrl);
    
    if (!response.ok) {
      throw new Error(`OMDb API returned status code ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to OMDb:', error.message);
    res.status(500).json({ 
      Response: 'False', 
      Error: 'Backend failed to query the OMDb API. Please check your network connection.' 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`CineSpace server running on http://localhost:${PORT}`);
});

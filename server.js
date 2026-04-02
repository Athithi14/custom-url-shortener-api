// server.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

// In-memory storage: shortCode -> { longUrl, createdAt }
const urlMap = new Map();

// Helper to generate a random 6-character code
function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
}

// --- API Endpoints ---

// 1. POST /shorten: Create a new short URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) {
        return res.status(400).json({ error: 'longUrl is required' });
    }

    // Check if this long URL already has a short code
    for (let [code, data] of urlMap.entries()) {
        if (data.longUrl === longUrl) {
            return res.json({ shortUrl: `http://localhost:${port}/${code}` });
        }
    }

    const shortCode = generateShortCode();
    urlMap.set(shortCode, { longUrl, createdAt: new Date() });
    res.status(201).json({
        shortUrl: `http://localhost:${port}/${shortCode}`,
        shortCode: shortCode,
        longUrl: longUrl
    });
});

// 2. GET /:shortCode: Redirect to the original URL
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const entry = urlMap.get(shortCode);

    if (!entry) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    // Send a 302 Found redirect response
    res.redirect(302, entry.longUrl);
});

// 3. GET /stats/:shortCode: Get info about a short link
app.get('/stats/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const entry = urlMap.get(shortCode);

    if (!entry) {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json({
        shortCode: shortCode,
        longUrl: entry.longUrl,
        createdAt: entry.createdAt
    });
});

// Start the server
app.listen(port, () => {
    console.log(`URL Shortener running at http://localhost:${port}`);
});

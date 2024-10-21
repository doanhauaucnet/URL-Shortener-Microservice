require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = {};
let urlCounter = 1; // Counter to generate short URLs

// Endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  console.log(originalUrl)

  // Check if the URL starts with http:// or https://
  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: 'invalid url' }); 
  }

  // Try to create a URL object to validate the format
  let url;
  try {
    url = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: 'invalid url' }); 
  }

  const host = url.hostname;

  // Validate the URL hostname using DNS lookup
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' }); 
    }

    // Generate a short URL
    const shortUrl = urlCounter++;

    // Store the original URL
    urlDatabase[shortUrl] = originalUrl;

    // Respond with the original and short URL
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Endpoint to redirect based on short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  // Check if the short URL exists
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    // Redirect to the original URL
    return res.redirect(originalUrl);
  } else {
    // If the short URL is not found
    return res.status(404).json({ error: 'No short URL found for this id.' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

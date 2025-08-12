require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let urls = [];
let idCounter = 1;

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);

  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = idCounter++;
    urls.push({ original_url: originalUrl, short_url: shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urls.find((item) => item.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});


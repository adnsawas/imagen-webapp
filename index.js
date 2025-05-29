const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const app = express();

// === CONFIG ===
const PROJECT_ID = 'learning-432304';
const LOCATION = 'us-central1';
const MODEL = 'imagen-3';
const PUBLISHER = 'google';
const SERVICE_ACCOUNT_PATH = './service_account/images-service-account.json';

// === MIDDLEWARE ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serves index.html at root

// === ROUTES ===
app.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;

  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });

  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/${PUBLISHER}/models/${MODEL}:predict`;

    const response = await axios.post(
      url,
      {
        instances: [{ prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageBase64 = response.data.predictions[0].bytesBase64Encoded;

    // Return HTML with image embedded
    res.send(`
      <h2>Generated Image</h2>
      <img src="data:image/png;base64,${imageBase64}" />
      <br><br>
      <a href="/">Generate Another</a>
    `);

  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).send(`<p>Error generating image. Try again later.</p><a href="/">Go back</a>`);
  }
});

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

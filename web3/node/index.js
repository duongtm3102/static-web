require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const mysql = require('mysql2/promise');
const cors = require('cors')

const app = express();
app.use(cors())

const port = 3000;

// Google Cloud Storage configuration
const storage = new Storage({
  projectId: process.env.YOUR_GCP_PROJECT_ID,
  keyFilename: './keyfile.json' // Update with your GCP keyfile path
});
const bucketName = process.env.YOUR_GCS_BUCKET_NAME;

const bucket = storage.bucket(bucketName);

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

// MySQL database configuration
const dbConfig = {
  host: process.env.YOUR_CLOUD_SQL_IP_ADDRESS,
  user: process.env.YOUR_CLOUD_SQL_USER,
  password: process.env.YOUR_CLOUD_SQL_PASSWORD,
  database: process.env.YOUR_CLOUD_SQL_DATABASE
};

// Function to execute MySQL queries
async function executeQuery(sql, params) {
  const connection = await mysql.createConnection(dbConfig);
  const [results, fields] = await connection.execute(sql, params);
  await connection.end();
  return results;
}

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;

  // Upload file to Google Cloud Storage
  try {
    await bucket.upload(file.path, {
      destination: file.originalname
    });

    const imageUrl = `https://storage.googleapis.com/${bucketName}/${file.originalname}`;

    // Save file info to MySQL database
    const sql = 'INSERT INTO images (url) VALUES (?)';
    await executeQuery(sql, [imageUrl]);

    res.send('File uploaded successfully!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint to fetch and display images
app.get('/images', async (req, res) => {
  try {
    const sql = 'SELECT * FROM images';
    const results = await executeQuery(sql);

    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

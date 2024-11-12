const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

// Create a secure agent for axios
const agent = new https.Agent({
  rejectUnauthorized: false, // This will ignore SSL certificate errors
});

// Test the local API
axios.get('http://localhost:3000', { httpsAgent: agent })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SRRS',
    database: 'srrs_db',
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Could not connect to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// IC Check Route
app.post('/api/check-ic', (req, res) => {
    const { icNumber } = req.body;
    db.query('SELECT * FROM Tenants WHERE tenant_ic = ?', [icNumber], (error, results) => {
        if (error) return res.status(500).json({ message: 'Database error', error });
        res.json({ exists: results.length > 0, tenant: results[0] || null });
    });
});

app.post('/api/verify', async (req, res) => {
    const { icNumber, imageUrl, latitude, longitude } = req.body;

    try {
        console.log('Route accessed for verification');
        console.log('Received data:', { icNumber, imageUrl, latitude, longitude });

        const tenantQuery = 'SELECT * FROM tenants WHERE tenant_ic = ?';
        const [results] = await db.promise().query(tenantQuery, [icNumber]);

        if (results.length === 0) {
            console.log('IC not found for:', icNumber);
            return res.status(404).json({ message: 'IC not found' });
        }

        const tenant = results[0];
        const isLocationMatch = calculateDistance(latitude, longitude, tenant.store_latitude, tenant.store_longitude) <= 50;
        const isFaceMatch = imageUrl === tenant.image_url;

        let result;
        if (isFaceMatch && isLocationMatch) {
            result = 'green';
        } else if (isFaceMatch) {
            result = 'yellow';
        } else {
            result = 'red';
        }

        console.log('Determined recognition result:', result);

        // Log before calling saveRecognitionResult
        console.log('Calling saveRecognitionResult with:', { icNumber, result });
        await saveRecognitionResult(icNumber, result);
        console.log('Successfully saved recognition result to database');

        return res.status(200).json({ result, isFaceMatch, isLocationMatch });
    } catch (error) {
        console.error('Error during verification:', error);
        return res.status(500).json({ error: 'Error processing verification' });
    }
});


// Function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

async function saveRecognitionResult(icNumber, result) {
    console.log('saveRecognitionResult called with:', { icNumber, result }); // Log this
    const query = 'INSERT INTO recognition_results (tenant_ic, result, created_at) VALUES (?, ?, NOW())';
    try {
        await db.promise().query(query, [icNumber, result]);
        console.log('Result saved successfully');
    } catch (err) {
        console.error('Error saving recognition result:', err);
        // Log the original query for debugging
        console.error('Query:', query, 'Values:', [icNumber, result]);
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

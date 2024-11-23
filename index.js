const express = require('express'); //web framework for building REST APIs and web server
const bodyParser = require('body-parser'); //middleware to parse incoming request bodies (e.g., JSON, URL-encoded data).
const mysql = require('mysql2');
const cors = require('cors'); //middleware to enable Cross-Origin Resource Sharing, allowing the server to handle requests from a different domain.
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express(); //an instance of an Express application
const PORT = 5000; //the server will listen on (5000) port

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', //configures the server to accept requests from a React app running at http://localhost:3000 (the frontend)
    methods: ['GET', 'POST'], //restricts allowed HTTP methods (GET and POST) used in web development to interact with servers, 
    allowedHeaders: ['Content-Type', 'Authorization'], //Limits the headers clients can send (Content-Type and Authorization)
}));
//Ensures the server can process various data formats (e.g., JSON, forms) from frontend forms or API calls
app.use(bodyParser.json({ limit: '10mb' })); //handles JSON payloads with a size limit of 10mb.
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); //parses URL-encoded form data, extended: true: allows nested objects in query strings
//GET (used to retrieve data from a server)
//Parameters are sent in the URL as query strings (e.g., ?key=value).
//Example URL: http://example.com/api/users?id=123.
//POST (used to send data to the server to create, update, or process something)
//Parameters are sent in the request body, not the URL.
//Example Body: { "username": "JohnDoe", "password": "12345" }.

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SRRS',
    database: 'srrs_db',
});

// Connect to MySQL
db.connect((err) => { //err: represents any error that occurs during the connection attempt.
    if (err) {
        console.error('Could not connect to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// IC Check Route
app.post('/api/check-ic', (req, res) => { //defines a POST route at the endpoint /api/check-ic, req: represents the request object sent by the client, res: represents the response object used to send data back to the client 
    const { icNumber } = req.body; //extracting IC Number, destructures the icNumber field from the body of the incoming request
    db.query('SELECT * FROM Tenant WHERE tenant_ic = ?', [icNumber], (error, results) => {
        if (error) return res.status(500).json({ message: 'Database error', error });
        res.json({ exists: results.length > 0, tenant: results[0] || null });
    });
});
//JSON date
//{
//    "icNumber": "12345678"
//}

// Calculate Distance Function (Haversine Formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (degree) => (degree * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Upload Image to imgBB
const uploadImageToImgBB = async (imagePath) => {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    try {
        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            params: { key: '110446ac0c62994840a07e952ac01b59' },
            headers: formData.getHeaders(),
        });
        return response.data.data.url;
    } catch (error) {
        console.error('Error uploading image to imgBB:', error);
        throw error;
    }
}

// Compare Faces using Face++
const compareFaces = async (url1, url2) => {
    const apiKey = 'v3QstKU7XOn-yoH0as7eQIQyDkP2FNXQ';
    const apiSecret = 'bXhoxanO-GfCuO-RpQP1xzCelVveacSB';
    try {
        const response = await axios.post('https://api-us.faceplusplus.com/facepp/v3/compare', null, {
            params: {
                api_key: apiKey,
                api_secret: apiSecret,
                image_url1: url1,
                image_url2: url2,
            },
        });
        return response.data.confidence >= 80; // Confidence threshold for face match
    } catch (error) {
        console.error('Error comparing faces:', error);
        return false;
    }
};

// Save Result to Database
async function saveRecognitionResult(icNumber, result) {
    const query = 'INSERT INTO recognition_result (tenant_ic, result, created_at) VALUES (?, ?, NOW())';
    try {
        await db.promise().query(query, [icNumber, result]);
        console.log('Recognition result saved successfully');
    } catch (err) {
        console.error('Error saving recognition result:', err);
    }
}

// Verification Route
app.post('/api/verify', async (req, res) => {
    const { icNumber, imageUrl, tenantImageUrl, latitude, longitude } = req.body;

    try {
        // Step 1: Retrieve tenant data (including store latitude and longitude)
        const query = 'SELECT * FROM shop WHERE tenant_ic = ?';
        const [results] = await db.promise().query(query, [icNumber]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const shop = results[0];

        // Step 2: Check location
        const isLocationMatch = calculateDistance(
            latitude,
            longitude,
            shop.latitude,
            shop.longitude
        ) <= 50; // Within 50 meters

        // Step 3: Compare faces
        const isFaceMatch = await compareFaces(imageUrl, tenantImageUrl);

        // Step 4: Determine result
        let result;
        if (isFaceMatch && isLocationMatch) {
            result = 'success';
        } else if (!isFaceMatch && !isLocationMatch) {
            result = 'fail';
        } else {
            result = 'incomplete';
        }

        // Step 5: Save result
        await saveRecognitionResult(icNumber, result);

        // Respond with result
        res.json({ result, isFaceMatch, isLocationMatch });
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get Tenant Image (Example Route for Frontend)
app.get('/api/tenant-image/:icNumber', async (req, res) => {
    const { icNumber } = req.params;

    try {
        // Retrieve tenant data
        const query = 'SELECT tenant_image FROM tenant WHERE tenant_ic = ?';
        const [results] = await db.promise().query(query, [icNumber]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const tenant = results[0];
        const tenantImageBuffer = Buffer.from(tenant.tenant_image, 'base64'); // Assuming the tenant image is stored as a base64 string in the DB

        // Create a temporary file to upload to imgBB
        const tempFilePath = path.join(__dirname, 'temp_tenant_image.jpg');
        fs.writeFileSync(tempFilePath, tenantImageBuffer);

        // Upload tenant image to imgBB
        const imageUrl = await uploadImageToImgBB(tempFilePath);

        // Clean up the temporary image file
        fs.unlinkSync(tempFilePath);

        // Respond with the image URL
        res.json({ imageUrl });
    } catch (error) {
        console.error('Error retrieving tenant image:', error);
        res.status(500).json({ message: 'Error retrieving tenant image', error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

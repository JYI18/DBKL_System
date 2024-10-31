// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Import MySQL library

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',      // Replace with your database host
    user: 'root',  // Replace with your MySQL username
    password: 'Jy18',  // Replace with your MySQL password
    database: 'dbkl'   // Replace with your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to verify login
    const query = 'SELECT * FROM admin_officer WHERE adminUsername = ? AND adminPassword = ?';
    db.execute(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Error processing request');
        }
        
        // Check if a matching user was found
        if (results.length > 0) {
            res.send('Login successful!');
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session'); // Import session library

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session management
app.use(session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // Session expires in 10 minutes
}));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jy18',
    database: 'dbkl'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Redirect to login if not logged in
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.redirect('/login');
    }
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admin_officer WHERE adminUsername = ? AND adminPassword = ?';
    db.execute(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Error processing request');
        }

        if (results.length > 0) {
            req.session.loggedIn = true;  // Set session variable
            res.redirect('/');
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

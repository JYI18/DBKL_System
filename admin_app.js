// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Note: mysql2 is required here for `db.execute`
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

app.get('/api/shops', (req, res) => {
    const sql = `
        SELECT tenant.tenant_name, tenant.tenant_ic, tenant.tenant_contact, 
               shop.shop_name, shop.shop_address, shop.latitude, 
               shop.longitude, recognition_result.result
        FROM tenant
        JOIN shop ON tenant.tenant_ic = shop.tenant_ic
        JOIN recognition_result ON tenant.tenant_ic = recognition_result.tenant_ic;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching shops:', err);
            res.status(500).json({ error: 'Failed to fetch shop details' });
            return;
        }
        res.json(results);
    });
});


// Add API endpoint for fetching tenants
app.get('/api/tenants', (req, res) => {
    const { tenant_ic = '', result = '' } = req.query;

    const sql = `
        SELECT tenant.*, recognition_result.result, shop.shop_name, shop.shop_address
        FROM tenant
        LEFT JOIN recognition_result ON tenant.tenant_ic = recognition_result.tenant_ic
        LEFT JOIN shop ON tenant.tenant_ic = shop.tenant_ic
        WHERE (tenant.tenant_ic = ? OR ? = '')
        AND (recognition_result.result = ? OR ? = '');

    `;

    db.query(sql, [tenant_ic, tenant_ic, result, result], (err, results) => {
        if (err) {
            console.error('Error fetching tenants:', err);
            res.status(500).json({ error: 'Failed to fetch tenants' });
            return;
        }
        res.json(results);
    });
});



// Serve tenants.html
app.get('/tenant_list.html', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'tenant_list.html'));
    } else {
        res.redirect('/admin_login');
    }
});

// Redirect to login if not logged in
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
    } else {
        res.redirect('/admin_login');
    }
});

// Serve the login page
app.get('/admin_login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
});

// Handle login form submission
app.post('/admin_login', (req, res) => {
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
app.get('/admin_logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/admin_login');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
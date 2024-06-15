const express = require('express');
const RADIUS = require('isc-radius');

// Create Express app
const app = express();
const PORT = 3000; // Port for the Express server
const RADIUS_PORT = 1812; // Port for the RADIUS server

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory user store for demonstration purposes
const users = { 'testuser': 'testpass' };

// Endpoint to add users (for demonstration)
app.post('/add-user', (req, res) => {
    const { username, password } = req.body;
    console.log(username)
    console.log(password)
    if (username && password) {
        users[username] = password;
        res.status(201).send('User added');
    } else {
        res.status(400).send('Username and password required');
    }
});

// Basic authentication handler
function myLogin(req, res) {
    console.log(req)
    const username = req.get('User-Name');
    const password = req.get('User-Password');
    if (users[username] && users[username] === password) {
        res.code = 'Access-Accept';
        return true;
    } else {
        res.code = 'Access-Reject';
        return false;
    }
}

// IP defaults handler
function ipDefaults(req, res) {
    if (res.code.toString() === 'Access-Accept') {
        if (!res.has('Framed-IP-Address')) {
            res.add('Framed-IP-Address', '255.255.255.254');
        }
        if (!res.has('Framed-IP-Netmask')) {
            res.add('Framed-IP-Netmask', '255.255.255.255');
        }
    }
}


const radiusServer = new RADIUS.Server({
  secret: 'your_secret',  // Set your shared secret
  handlers: [myLogin, ipDefaults]
});

radiusServer.start(RADIUS_PORT, () => {
  console.log(`RADIUS server listening on port ${RADIUS_PORT}`);
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});

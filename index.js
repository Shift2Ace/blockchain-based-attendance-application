const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const db = require('./lib/data/blockchain.json');
const users = db.users;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'lib/views'));

// Path of the html folder
const html_folder = "lib/views/html"

// Page direct
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/wallet', (req, res) => {
    res.render('wallet');
});

app.get('/table', (req, res) => {
    const html = `
        <table>
            ${users.map((item) => `<tr><td>${item.name}</td></tr>`).join('')}
        </table>
    `;
    res.send(html);
});

// ...

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
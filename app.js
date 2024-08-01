const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3001;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nbagame'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('Connected to database');
});

global.db = db;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// CRUD routes for players
app.route('/players')
    .get((req, res) => {
        const query = 'SELECT * FROM players';
        db.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching players:', err);
                return res.status(500).send('Error fetching players');
            }

            // Sort players by team_id
            result.sort((a, b) => a.team_id - b.team_id);

            res.render('players', { players: result });
        });
    })
    .post((req, res) => {
        const { name, team_id, position, height, weight, points, steals, assists, rebounds } = req.body;
        console.log('Received data:', req.body); // Log received data
        const query = 'INSERT INTO players (name, team_id, position, height, weight, points, steals, assists, rebounds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, team_id, position, height, weight, points, steals, assists, rebounds], (err) => {
            if (err) {
                console.error('Error inserting player:', err);
                return res.status(500).send(`Error inserting player: ${err.sqlMessage}`);
            }
            res.redirect('/players');
        });
    });

app.route('/players/create')
    .get((req, res) => {
        res.render('addplayer', { action: '/players', player: null });
    });

app.route('/players/edit/:id')
    .get((req, res) => {
        const query = 'SELECT * FROM players WHERE id = ?';
        db.query(query, [req.params.id], (err, result) => {
            if (err) {
                console.error('Error fetching player:', err);
                return res.status(500).send('Error fetching player');
            }
            res.render('addplayer', { player: result[0], action: '/players/edit/' + req.params.id });
        });
    })
    .post((req, res) => {
        const { name, team_id, position, height, weight, points, steals, assists, rebounds } = req.body;
        const query = 'UPDATE players SET name = ?, team_id = ?, position = ?, height = ?, weight = ?, points = ?, steals = ?, assists = ?, rebounds = ? WHERE id = ?';
        db.query(query, [name, team_id, position, height, weight, points, steals, assists, rebounds, req.params.id], (err) => {
            if (err) {
                console.error('Error updating player:', err);
                return res.status(500).send('Error updating player');
            }
            res.redirect('/players');
        });
    });

app.get('/players/delete/:id', (req, res) => {
    const query = 'DELETE FROM players WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) {
            console.error('Error deleting player:', err);
            return res.status(500).send('Error deleting player');
        }
        res.redirect('/players');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

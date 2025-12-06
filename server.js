const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Create database
const db = new sqlite3.Database("./transcript.db");

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Create transcript table
db.run(`CREATE TABLE IF NOT EXISTS transcripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    grade TEXT
)`);

app.get("/", (req, res) => {
    res.send("Backend is running successfully!");
});


app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password],
        function (err) {
            if (err) return res.json({ error: "Email already exists" });
            res.json({ message: "User registered", id: this.lastID });
        }
    );
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE email = ? AND password = ?`,
        [email, password],
        (err, user) => {
            if (user) res.json({ message: "Login successful", user });
            else res.json({ error: "Invalid credentials" });
        }
    );
});


app.get("/transcript/:userId", (req, res) => {
    const userId = req.params.userId;

    db.all(
        `SELECT * FROM transcripts WHERE user_id = ?`,
        [userId],
        (err, rows) => {
            res.json(rows);
        }
    );
});

app.post("/transcript", (req, res) => {
    const { user_id, subject, grade } = req.body;

    db.run(
        `INSERT INTO transcripts (user_id, subject, grade) VALUES (?, ?, ?)`,
        [user_id, subject, grade],
        () => res.json({ message: "Transcript added" })
    );
});

app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});

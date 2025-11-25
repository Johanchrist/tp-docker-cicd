const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:*',
        'http://frontend'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Configuration de la base de données
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'database',
    database: process.env.DB_NAME || 'messages_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Initialisation de la base de données
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

// Route pour récupérer tous les messages
app.get("/api/messages", async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM messages ORDER BY created_at DESC'
        );
        res.json({
            messages: result.rows,
            success: true
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({
            error: 'Failed to fetch messages',
            success: false
        });
    }
});

// Route pour ajouter un message
app.post("/api/messages", async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                error: 'Message content is required',
                success: false
            });
        }

        const result = await pool.query(
            'INSERT INTO messages (content) VALUES ($1) RETURNING *',
            [content.trim()]
        );

        res.json({
            message: 'Message added successfully',
            newMessage: result.rows[0],
            success: true
        });
    } catch (err) {
        console.error('Error adding message:', err);
        res.status(500).json({
            error: 'Failed to add message',
            success: false
        });
    }
});

// Route de santé de la base de données
app.get("/api/health", async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            database: 'connected',
            success: true
        });
    } catch (err) {
        res.json({
            database: 'disconnected',
            error: err.message,
            success: false
        });
    }
});

// Route racine existante (conservée pour compatibilité)
app.get("/api", (req, res) => {
    res.json({
        message: "Hello from Backend with Database!",
        timestamp: new Date().toISOString(),
        client: req.get('Origin') || 'unknown',
        success: true
    });
});

// Initialisation et démarrage du serveur
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
});
// Dans server.js - Ajouter une fonction de reconnexion
async function connectWithRetry(pool, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query('SELECT 1');
            console.log('Database connected successfully');
            return;
        } catch (err) {
            console.log(`Database connection attempt ${i + 1} failed: ${err.message}`);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('Unable to connect to database after multiple attempts');
}

// Modifier l'initialisation
async function initDatabase() {
    try {
        await connectWithRetry(pool);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path= require('path')

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Route: Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Create database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Connect to database and set up initial schema
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Successful connection to database!");
        setupDatabase();
    }
});

function setupDatabase() {
    const db = `CREATE DATABASE IF NOT EXISTS martin_expense_tracker`;
    connection.query(db, (err) => {
        if (err) {
            console.error("Error creating database:", err);
        } else {
            connection.changeUser({ database: 'martin_expense_tracker' }, (err) => {
                if (err) {
                    console.error("Error selecting database:", err);
                } else {
                    console.log("Database `martin_expense_tracker` selected!");
                    createTables();
                }
            });
        }
    });
}

function createTables() {
    const tbUsers = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )`;
    connection.query(tbUsers, (err) => {
        if (err) {
            console.error("Failed to create users table:", err);
        } else {
            console.log("Table users created successfully!");
        }
    });

    const tbExpenses = `CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`;
    connection.query(tbExpenses, (err) => {
        if (err) {
            console.error("Error creating expenses table:", err);
        } else {
            console.log("Table expenses created successfully!");
        }
    });
}

// Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Route: User Registration
app.post('/api/register', (req, res) => {
    try {
        const sqlUsers = `SELECT * FROM users WHERE username= ?`;
        connection.query(sqlUsers, [req.body.username], (err, data) => {
            if (err) return res.status(500).json("Database query error");
            if (data.length > 0) return res.status(409).json("User already exists!");

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);

            const newUser = `INSERT INTO users(email, username, password) VALUES(?, ?, ?)`;
            const values = [req.body.email, req.body.username, hashedPassword];
            connection.query(newUser, values, (err, data) => {
                if (err) return res.status(500).json("Something went wrong");
                return res.status(201).json("User registered successfully!");
            });
        });
    } catch (error) {
        return res.status(500).json("Internal server error");
    }
});

// Route: User Login
app.post('/api/login', (req, res) => {
    try {
        const sqlUser = `SELECT * FROM users WHERE username = ?`;
        connection.query(sqlUser, [req.body.username], (err, data) => {
            if (err) return res.status(500).json("Database query error");
            if (data.length === 0) return res.status(400).json("User not found");

            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password);
            if (!isPasswordValid) return res.status(400).json("Invalid username or password!");

            const user = { id: data[0].id, username: data[0].username };
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            return res.status(200).json({ token: accessToken });
        });
    } catch (error) {
        res.status(500).json("Internal server error");
    }
});

// Route: Add Expense
app.post('/api/expense', authenticateToken, (req, res) => {
    const { amount, date, category } = req.body;
    const userId = req.user.id;

    if (!amount || !date || !category) {
        return res.status(400).json("All fields are required.");
    }

    const insertExpense = `INSERT INTO expenses(user_id, amount, date, category) VALUES(?, ?, ?, ?)`;
    const values = [userId, amount, date, category];
    
    connection.query(insertExpense, values, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json("Database error");
        }
        return res.status(200).json("Expense added successfully!");
    });
});

// Route: View Expenses
app.get('/api/expense', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const viewExpense = `SELECT * FROM expenses WHERE user_id = ?`;

    connection.query(viewExpense, [userId], (err, data) => {
        if (err) return res.status(500).json("Internal server error");
        return res.status(200).json(data);
    });
});

// Route: Delete Expense
app.delete('/api/expense/:expenseId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.expenseId;
    console.log('Deleting expense with ID:', expenseId, 'for user ID:', userId);

    const deleteExpenseQuery = `DELETE FROM expenses WHERE user_id = ? AND id = ?`;

    connection.query(deleteExpenseQuery, [userId, expenseId], (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json("Error deleting expense");
        }
        if (result.affectedRows === 0) {
            return res.status(404).json("Expense not found");
        }
        return res.status(200).json("Expense deleted successfully!");
    });
});

// Route: Update Expense
app.put('/api/expense/:expenseId', authenticateToken, (req, res) => {
    const expenseId = req.params.expenseId;
    const { amount, date, category } = req.body;
    const userId = req.user.id;

    if (!amount || !date || !category) {
        return res.status(400).json("All fields are required.");
    }

    const updateExpenseQuery = `UPDATE expenses SET amount = ?, date = ?, category = ? WHERE user_id = ? AND id = ?`;
    const values = [amount, date, category, userId, expenseId];

    connection.query(updateExpenseQuery, values, (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json("Error updating expense");
        }
        if (result.affectedRows === 0) {
            return res.status(404).json("Expense not found");
        }
        return res.status(200).json("Expense updated successfully!");
    });
});

// Start server
const server=app.listen(3000, '127.0.0.1', (err) => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("The server is running on http://%s:%s", host, port);
});

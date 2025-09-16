import snowflake from 'snowflake-sdk';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure middleware
app.use(cors());
app.use(express.json());

// Configure static file serving for the frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../src')));

// Snowflake connection function
async function executeSnowflakeQuery(query) {
    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        password: process.env.SNOWFLAKE_PASSWORD,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA
    });

    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }

            connection.execute({
                sqlText: query,
                complete: (err, stmt, rows) => {
                    connection.destroy();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            });
        });
    });
}

// API endpoint for Snowflake queries
app.post('/api/snowflake/query', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const results = await executeSnowflakeQuery(query);
        res.json(results);
    } catch (error) {
        console.error('Error executing Snowflake query:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main HTML file for any other route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoint available at http://localhost:${PORT}/api/snowflake/query`);
});
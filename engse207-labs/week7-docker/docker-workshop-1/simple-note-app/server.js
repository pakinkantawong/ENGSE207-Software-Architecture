const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ============================================
// 📌 VERSION 2: PostgreSQL Storage
// ============================================

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'noteuser',
    password: process.env.DB_PASSWORD || 'notepass',
    database: process.env.DB_NAME || 'notedb',
});

// Initialize database
async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // เพิ่ม sample data ถ้ายังไม่มี
        const result = await client.query('SELECT COUNT(*) FROM notes');
        if (parseInt(result.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO notes (title, content) VALUES 
                ('Note แรก', 'เรียนรู้ Docker'),
                ('Note ที่สอง', 'ฝึกใช้ PostgreSQL')
            `);
        }
        
        console.log('✅ Database initialized');
    } finally {
        client.release();
    }
}

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ 
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// GET /api/notes - ดู notes ทั้งหมด
app.get('/api/notes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notes ORDER BY created_at DESC'
        );
        console.log(`📋 GET /api/notes - Found ${result.rows.length} notes`);
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/notes - เพิ่ม note ใหม่
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุ title และ content'
            });
        }
        
        const result = await pool.query(
            'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        );
        
        console.log(`✅ POST /api/notes - Created: ${title}`);
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'สร้าง note สำเร็จ'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/notes/:id - ลบ note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pool.query(
            'DELETE FROM notes WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: `ไม่พบ note #${id}`
            });
        }
        
        console.log(`🗑️ DELETE /api/notes/${id}`);
        res.json({
            success: true,
            message: `ลบ note #${id} สำเร็จ`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Start Server
// ============================================
async function start() {
    try {
        await initDatabase();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════╗');
            console.log('║        📝 Simple Note App - Version 2              ║');
            console.log('╠════════════════════════════════════════════════════╣');
            console.log(`║  🚀 Server running on port ${PORT}                 ║`);
            console.log('║  📊 Storage: PostgreSQL                            ║');
            console.log(`║  🗄️  DB Host: ${process.env.DB_HOST || 'localhost'}║`);
            console.log('╚════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
    }
}

start();
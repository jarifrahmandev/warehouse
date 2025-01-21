const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId

const app = express();
const PORT = 3000;

const url = 'mongodb://localhost:27017';
const dbName = 'warehouse';
let db;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // To parse JSON bodies

async function connect() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
    if (!db) {
        await connect();
    }
    next();
});

// Initialize default shelves
async function initializeShelves() {
    const collection = db.collection('shelves');
    const shelves = await collection.find({}).toArray();
    if (shelves.length === 0) {
        await collection.insertMany([
            { x: -50, z: 0 },
            { x: 50, z: 0 },
            { x: 0, z: 50 },
            { x: 0, z: -50 }
        ]);
    }
}

// Get shelves
app.get('/shelves', async (req, res) => {
    const collection = db.collection('shelves');
    const shelves = await collection.find({}).toArray();
    res.json(shelves);
});

// Update shelf position
app.put('/shelves/:id', async (req, res) => {
    const { id } = req.params;
    const { x, z } = req.body;
    const collection = db.collection('shelves');
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { x, z } });
    res.status(200).send();
});

app.listen(PORT, async () => {
    await connect();
    await initializeShelves();
    console.log(`Server is running on http://localhost:${PORT}`);
});
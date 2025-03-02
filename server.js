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
app.put('/shelves', async (req, res) => {
    const { currentX, currentZ, newX, newZ } = req.body;
    const collection = db.collection('shelves');

    // Check for duplicate coordinates
    const existingShelf = await collection.findOne({ x: newX, z: newZ });
    if (existingShelf) {
        return res.status(400).json({ error: 'Duplicate coordinates are not allowed' });
    }

    // Find and update the shelf by current coordinates
    const result = await collection.updateOne(
        { x: currentX, z: currentZ },
        { $set: { x: newX, z: newZ } }
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Shelf not found' });
    }

    res.status(200).send();
});

// Add new shelf
app.post('/shelves', async (req, res) => {
    const { x, z } = req.body;
    const collection = db.collection('shelves');

    // Check for duplicate coordinates
    const existingShelf = await collection.findOne({ x, z });
    if (existingShelf) {
        return res.status(400).json({ error: 'Duplicate coordinates are not allowed' });
    }

    await collection.insertOne({ x, z });
    res.status(201).send();
});

app.delete('/shelves/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.collection('shelves').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(200).send({ message: 'Shelf deleted successfully' });
        } else {
            res.status(404).send({ message: 'Shelf not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error deleting shelf', error });
    }
});


app.listen(PORT, async () => {
    await connect();
    await initializeShelves();
    console.log(`Server is running on http://localhost:${PORT}`);
});
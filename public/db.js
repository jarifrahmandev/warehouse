const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'warehouse';
let db;

async function connect() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
}

function getDb() {
    return db;
}

async function saveShelfCoordinates(x, z) {
    const db = getDb();
    const collection = db.collection('shelves');
    await collection.insertOne({ x, z });
}

async function getShelfCoordinates() {
    const db = getDb();
    const collection = db.collection('shelves');
    return await collection.find({}).toArray();
}

module.exports = { connect, getDb, saveShelfCoordinates, getShelfCoordinates };
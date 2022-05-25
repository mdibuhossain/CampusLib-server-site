const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5p7yt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('Campuslib');
        const dataCollection = database.collection('data');
        const usersCollection = database.collection('users');

        // get books
        app.get('/data', async (req, res) => {
            const cursor = dataCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // get users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // post user
        app.post('/user_post', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('CampusLib');
})

app.listen(port, () => {
    console.log("listening PORT", port);
})
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://campuslib_admin:${process.env.DB_PASS}@cluster0.gqncx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('campuslib');
        const booksCollection = database.collection('books');

        // get books
        app.get('/books', async (req, res) => {
            const cursor = booksCollection.find({});
            const result = await cursor.toArray();
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
    res.send('CampusLib running live');
})

app.listen(port, () => {
    console.log("listening PORT", port);
})
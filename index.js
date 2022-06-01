const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
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
        const booksCollection = database.collection('books');
        const syllabusCollection = database.collection('syllabus');
        const questionsCollection = database.collection('questions');
        const usersCollection = database.collection('users');

        // get books
        app.get('/books', async (req, res) => {
            const cursor = booksCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // get questions
        app.get('/questions', async (req, res) => {
            const cursor = questionsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // get syllabus
        app.get('/syllabus', async (req, res) => {
            const cursor = syllabusCollection.find({});
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

        // post book
        app.post('/post_book', async (req, res) => {
            const book = req.body;
            const result = await booksCollection.insertOne(book);
            res.json(result)
        })

        // post question
        app.post('/post_question', async (req, res) => {
            const question = req.body;
            const result = await questionsCollection.insertOne(question);
            res.json(result)
        })

        // post syllabus
        app.post('/post_syllabus', async (req, res) => {
            const syllabus = req.body;
            const result = await syllabusCollection.insertOne(syllabus);
            res.json(result)
        })

        // delete book
        app.delete('/book/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await booksCollection.deleteOne(query);
            res.json(result);
        })

        // delete question
        app.delete('/question/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await questionsCollection.deleteOne(query);
            res.json(result);
        })

        // delete syllabus
        app.delete('/syllabus/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await syllabusCollection.deleteOne(query);
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
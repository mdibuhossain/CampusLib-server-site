const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();
const port = process.env.PORT || 5000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5p7yt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const verityToken = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const finalToken = token.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(finalToken);
        req.decodeEmail = decodedToken.email;
        next();
    } catch (e) {
        return res.status(401).send('Unauthorized');
    }
}

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
        app.get('/users', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.role === 'admin') {
                    const cursor = usersCollection.find({});
                    const result = await cursor.toArray();
                    res.json(result);
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })

        // Check admin
        app.get('/user/checkadmin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            let isAdmin = false;
            if (result?.role === 'admin')
                isAdmin = true;
            res.json({ admin: isAdmin })
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

        // make user admin
        app.put('/user/makeadmin/:id', verityToken, async (req, res) => {
            const id = req.params.id;
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.role === 'admin') {
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: { role: "admin" } };
                    const result = await usersCollection.updateOne(query, update, options);
                    res.json(result);
                }
                else {
                    res.json({ error: "You are not admin" });
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })

        // update content
        app.put('/update_book/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.email) {
                    const id = req.params.id;
                    const data = req.body;
                    delete data._id;
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: data };
                    const result = await booksCollection.updateOne(query, update, options);
                    res.json(result);
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })
        app.put('/update_question/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.email) {
                    const id = req.params.id;
                    const data = req.body;
                    delete data._id;
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: data };
                    const result = await questionsCollection.updateOne(query, update, options);
                    res.json(result);
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })
        app.put('/update_syllabus/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.email) {
                    const id = req.params.id;
                    const data = req.body;
                    delete data._id;
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: data };
                    const result = await syllabusCollection.updateOne(query, update, options);
                    res.json(result);
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })

        // change content status
        app.put('/book/status/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.role === 'admin') {
                    const id = req.params.id;
                    const status = req.body;
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: { status: status.status } };
                    const result = await booksCollection.updateOne(query, update, options);
                    res.json(result);
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })
        app.put('/question/status/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.role === 'admin') {
                    const id = req.params.id;
                    const status = req.body;
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: { status: status.status } };
                    const result = await questionsCollection.updateOne(query, update, options);
                    res.json(result);
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })
        app.put('/syllabus/status/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.role === 'admin') {
                    const id = req.params.id;
                    const status = req.body;
                    const query = { _id: ObjectId(id) };
                    const options = { upsert: true };
                    const update = { $set: { status: status.status } };
                    const result = await syllabusCollection.updateOne(query, update, options);
                    res.json(result);
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })

        // delete book
        app.delete('/book/delete/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.email) {
                    const id = req.params.id;
                    const query = { _id: ObjectId(id) };
                    const result = await booksCollection.deleteOne(query);
                    res.json(result);
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })

        // delete question
        app.delete('/question/delete/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.email) {
                    const id = req.params.id;
                    const query = { _id: ObjectId(id) };
                    const result = await questionsCollection.deleteOne(query);
                    res.json(result);
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        })

        // delete syllabus
        app.delete('/syllabus/delete/:id', verityToken, async (req, res) => {
            const requester = req.decodeEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount?.email) {
                    const id = req.params.id;
                    const query = { _id: ObjectId(id) };
                    const result = await syllabusCollection.deleteOne(query);
                    res.json(result);
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
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
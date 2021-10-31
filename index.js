const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwjoa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('spicyX');
        const packageCollection = database.collection('packages');
        const bookedPackageCollection = database.collection('bookedPackages');

        // GET API - ALL 
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();

            res.send(packages);
        });

        // getting all-packages
        app.get('/manage-packages/', async (req, res) => {
            const cursor = bookedPackageCollection.find({});
            const bookedPackages = await cursor.toArray();
            console.log('All booked Packages are loaded');
            res.send(bookedPackages);
        });

        // getting my-packages
        app.get('/my-packages/:email', async (req, res) => {
            const email = req.params.email;

            const cursor = bookedPackageCollection.find({});
            const bookedPackages = await cursor.toArray();
            console.log(email);
            const myPackages = bookedPackages.filter(pack => pack.user.email === email);

            res.send(myPackages);
        });

        // GET API - SINGLE ELEMENT
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            console.log('Getting specific package');
            const query = { _id: ObjectId(id) };

            const package = await packageCollection.findOne(query);
            res.json(package);
        })
        // POST API - BOOK PACKAGE
        app.post('/packages', async (req, res) => {
            const bookedPackage = req.body;
            console.log('Hit the post api', bookedPackage);

            const result = await bookedPackageCollection.insertOne(bookedPackage);
            console.log(result);
            res.json(result);
        })

        // POST API - ADD PACKAGE

        // UPDATE API - 

        // DELETE API - DELETE A PACKAGE 
        app.delete('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedPackageCollection.deleteOne(query);
            res.json(result);
        });
    }
    finally {
        // await client.close(); 
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('SpicyX Tourism server is running');
});

app.listen(port, () => {
    console.log('Running SpicyX at port: ', port);
})


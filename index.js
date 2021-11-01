const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
// everything has been imported based on our need

const app = express();
const port = process.env.PORT || 5000;
// middleware has been used for CORS & JSON data conversion
app.use(cors());
app.use(express.json());

// uri of mongodb connection with secret username & password
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwjoa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect(); // connecting the database
        const database = client.db('spicyX'); // creating a new DB
        // creating  new collections
        const packageCollection = database.collection('packages');
        const bookedPackageCollection = database.collection('bookedPackages');

        // GET API: for all package data we need to show on the UI
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();

            res.send(packages);
        });

        //GET API:  getting all-booked-packages to manage packages
        app.get('/manage-packages/', async (req, res) => {
            const cursor = bookedPackageCollection.find({});
            const bookedPackages = await cursor.toArray();
            // console.log('All booked Packages are loaded');
            res.send(bookedPackages);
        });

        //GET API: getting my-BOOKED-packages to show user specific packages
        app.get('/my-packages/:email', async (req, res) => {
            const email = req.params.email;

            const cursor = bookedPackageCollection.find({});
            const bookedPackages = await cursor.toArray();
            // console.log(email);
            const myPackages = bookedPackages.filter(pack => pack.user.email === email);

            res.send(myPackages);
        });

        // GET API: SINGLE package by packageId for booking this package
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('Getting specific package');
            const query = { _id: ObjectId(id) };

            const package = await packageCollection.findOne(query);
            res.json(package);
        });



        // POST API - BOOK PACKAGE - with user information
        app.post('/manage-packages', async (req, res) => {
            const bookedPackage = req.body;
            // console.log('Hit the post api', bookedPackage);

            const result = await bookedPackageCollection.insertOne(bookedPackage);
            // console.log(result);
            res.json(result);
        });

        // POST API - Add a new PACKAGE
        app.post('/packages', async (req, res) => {
            const newPack = req.body;
            // console.log('Hit the post api', newPack);

            const result = await packageCollection.insertOne(newPack);
            // console.log(result);
            res.json(result);
        });



        // UPDATE API - update status of a specific package
        app.put('/manage-packages/:id', async (req, res) => {
            const id = req.params.id;
            const updatedPack = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { // doc of changed props
                $set: {
                    isPending: updatedPack.isPending
                }
            };
            const result = await bookedPackageCollection.updateOne(filter, updateDoc, options);

            // console.log('Updating user', id);
            // console.log('Request: ', updatedPack);
            res.json(result);
        });



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


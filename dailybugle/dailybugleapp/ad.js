const hostname = "0.0.0.0";
const port = 3040;
// ad microservice
const express = require ('express');
const app = express();
const { MongoClient, ObjectId } = require ("mongodb");
const uri="mongodb://host.docker.internal:27017";
const client = new MongoClient(uri);


app.use(express.json());
app.listen(port, hostname, ()=> console.log(`server running at http://${hostname}:${port}`));

// CREATE
app.post('/', async (request, response) => {
    const adData = request.body;
    try {
        await client.connect();
        const result = await client.db('dailybugle').collection('ad').insertOne(adData);
        response.send(result);
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Internal Server Error' });
    } finally {
        client.close();
    }
});

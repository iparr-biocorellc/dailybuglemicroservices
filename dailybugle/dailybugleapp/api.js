const hostname = "0.0.0.0";
const port = 3020;
// story microservice
const express = require ('express');
const app = express();
const { MongoClient, ObjectId } = require ("mongodb");
const uri="mongodb://host.docker.internal:27017";
const client = new MongoClient(uri);


app.use(express.json());
app.listen(port, hostname, ()=> console.log(`server running at http://${hostname}:${port}`));

// CREATE
app.post('/story', async (request, response) => {
    const storyData = request.body;
    try {
        await client.connect();
        const result = await client.db('dailybugle').collection('story').insertOne(storyData);
        
        // Extract the _id from the inserted document
        const newDocumentId = result.insertedId.toString();
        response.send({ _id: newDocumentId });
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Internal Server Error' });
    } finally {
        client.close();
    }
});

// DELETE
app.delete('/story', async (request, response) => {
    const storyData = request.body;
    const storyFilter = { "_id": new ObjectId(storyData._id) };
    try {
        await client.connect();
        await client.db('dailybugle').collection('story')
        .deleteOne(storyFilter)
        .then( results=> response.send(results))
        .catch( error=> console.error(error));
    } catch (error) {
        console.error(error);
    } finally {
        client.close();
    }
});


// GET, READ
app.get('/story', async (request, response) => {
    try {
        await client.connect();
        await client.db('dailybugle').collection('story')
        .find()
        .toArray()
        .then ( results => {
            response.send( results);
        })
        .catch( error=> console.error(error));
    } catch (error) {
        console.error(error);
    } finally {
        client.close();
    }
});

// UPDATE, PUT
app.put('/story', async ( request, response) => {
    const storyData = request.body;
    const storyFilter = { "_id": new ObjectId(storyData._id) };
    const updateStory = {
        $set: {
            "title": storyData.title,
            "teaser": storyData.teaser,
            "story": storyData.story,
            "metadata": storyData.metadata,
        }
    };
    try {
        await client.connect();
        await client.db('dailybugle').collection('story')
        .updateOne(storyFilter, updateStory)
        .then( results=> response.send(results))
        .catch( error=> console.error(error));
    } catch (error) {
        console.error(error);
    } finally {
        client.close();
    }
});


app.put('/comment', async (request, response) => {
    const commentData = request.body;
    const _id = commentData._id;
    const newComment = {
        user: commentData.user,
        comment_text: commentData.comment_text,
    };

    const storyFilter = { "_id": new ObjectId(_id) };

    try {
        await client.connect();
        const result = await client.db('dailybugle').collection('story')
            .updateOne(storyFilter, { $push: { "comments": newComment } });

        if (result.modifiedCount > 0) {
        } else {
            console.error("Story not found or comment not added");
        }
    } catch (error) {
        console.error(error);
    } finally {
        client.close();
    }
});

const hostname = "0.0.0.0";
const port = 3030;
// auth microservice
// Import necessary modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require ('express');
const { MongoClient, ObjectId } = require ("mongodb");
const { log } = require('console');

const app = express();
const uri="mongodb://host.docker.internal:27017";
const client = new MongoClient(uri);


app.use(express.json());
app.listen(port, hostname, ()=> console.log(`server running at http://${hostname}:${port}`));

app.post('/register', async (request, response) => {
  const userData = request.body;
  const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash the password
  const user = {
    username: userData.username,
    password: hashedPassword,
    role: userData.role || 'reader', // Set a default role if not provided
  };

  try {
    await client.connect();

    // Check if the username already exists
    const existingUser = await client
      .db('dailybugle')
      .collection('auth')
      .findOne({ username: user.username });

    if (existingUser) {
      // Username is already taken
      response.status(400).json({ result: 0, error: 'Username is already taken' });
      return;
    }

    // Username is available, proceed with registration
    const result = await client.db('dailybugle').collection('auth').insertOne(user);
    response.json({ result: 1 }); // Indicate success with a result of 1
  } catch (error) {
    console.error(error);
    response.status(500).json({ result: 0, error: 'Internal Server Error' }); // Indicate failure with a result of 0
  } finally {
    client.close();
  }
});


app.post('/login', async (request, response) => {
  const loginData = request.body;

  try {
    await client.connect();
    const user = await client.db('dailybugle').collection('auth').findOne({ username: loginData.username });
    if (user) {
      compareResult = await bcrypt.compare(loginData.password, user.password);
      if (compareResult) {
        const token = jwt.sign({ username: user.username, role: user.role }, 'your-secret-key', { expiresIn: '1h' });
        response.json({ token });
      } else {
        response.status(401).json({ error: 'Invalid password.' });
      }
    } else {
      response.status(401).json({ error: 'Invalid username.' });
    }
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
});


app.get('/authorization', async (request, response) => {
  const token = request.headers['authorization'];

  if (!token) {
    return response.status(200).json({ role: 'anonymous' });
  }

  try {
    // Decode the token
    const user = jwt.verify(token, 'your-secret-key');
    
    // Now, `user` contains information about the authenticated user

    // Check the user's role
    const role = user.role || 'anonymous'; // Default to 'anonymous' if the role is not defined

    response.status(200).json({ role });
  } catch (error) {
    console.error(error);
    response.status(403).json({ error: 'Forbidden - Invalid Token' });
  }
});




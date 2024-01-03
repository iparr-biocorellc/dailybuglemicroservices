// candidate microservice
const http = require ('http');
const url = require('url')

const { MongoClient } = require ('mongodb');

const mongoURI = "mongodb://0.0.0.0:27017";

const client = new MongoClient(mongoURI);

const hostname = "127.0.0.1";
const port = 3003;
const server = http.createServer();

server.on('request', async ( request, response) => {
    // check the path, and invoke one function or another
    let q = url.parse(request.url,true);
    console.log(q.pathname);
    switch (q.pathname) {
        case "/":
            console.log("Getting news story.");
            returnStory = await getStory();
            break;
    }
    // gotten our data to return, we'll send a response
    response.writeHead(200, { 'Content-type':'text/JSON'});
    response.end( JSON.stringify( { "message":"Hello, world!"}));
})
server.on('error', error=>console.error(error.stack));

server.listen(port, hostname, () => console.log(`server running at http://${hostname}:${port}`));

const getStory = async () => {
    const story = [
        {
            "title": "Mountain Lion Attacks Virginia Man",
            "story": "A man was hiking in the woods when he was attacked by a mountain lion.",
            "comments": [
                {
                    "user": "Sally",
                    "comment_text": "That's terrifying!"
                },
                {
                    "user": "James",
                    "comment_text": "I hope he's okay."
                },
                {
                    "user": "Jay",
                    "comment_text": "This is why I never hike alone."
                }
            ],
            "metadata": {
                "teaser": "Mountain Lion Attack",
                "date": "2018-01-01",
                "edited_date": "2018-01-01",
                "author": "John Doe"
            }
        }
    ];

    return story;
};
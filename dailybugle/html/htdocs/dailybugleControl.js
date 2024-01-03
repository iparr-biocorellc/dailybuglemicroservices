// front end JS for daily bugle app
const endpoint = {};
endpoint['story'] = 'http://localhost:8001/api/dailybugle/story';
endpoint['comment'] = 'http://localhost:8001/api/dailybugle/comment';


const viewType = {
    main: 'main',
    single: 'single',
}

function initPage() {    
    loadContent(viewType['main']);
}

function loadContent(view, _id) {
    switch(view) {
        case viewType['main']:
            loadStories();
            break;
        case viewType['single']:
            loadStory(_id);
            break;
        default:
            break;
    }
}

// Assuming you have the getStories function already defined

function loadStories() {
    getStories()
        .then(stories => {
            // Assuming stories is an array of story objects

            // Shuffle the array to randomize the order
            const shuffledStories = shuffleArray(stories);

            // Select the first three stories
            const mainStory = shuffledStories[0];
            const subStory1 = shuffledStories[1];
            const subStory2 = shuffledStories[2];

            // Load the stories into the HTML elements
            document.getElementById('main_story').innerHTML = `
                <h1>${mainStory.title}</h1>
                <p>${mainStory.story}</p>
            `;

            document.getElementById('sub_story1').innerHTML = `
                <h2>${subStory1.title}</h2>
                <p>${subStory1.teaser}</p>
            `;

            document.getElementById('sub_story2').innerHTML = `
                <h2>${subStory2.title}</h2>
                <p>${subStory2.teaser}</p>
            `;
        })
        .catch(error => {
            // Handle errors
            console.error(error);
        });
}

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function deleteStory(_id) {
    const storyData = { "_id":_id};
    let deleteStory = fetch(endpoint['story'],
    { method: 'DELETE',
    headers: {
        'content-type':'application/json'
    },
    body: JSON.stringify(storyData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error deleting story');
        }
    }
    )  
}
function createStory(storyData) {
    let createStory = fetch(endpoint['story'],
    {
        method: 'POST',
        headers: {
            'content-type':'application/json'
        },
        body: JSON.stringify(storyData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error creating story');
        }
    }
    )
}

function updateStory(storyData) {
    let updateStory = fetch(endpoint['story'],
    {
        method: 'PUT',
        headers: {
            'content-type':'application/json'
        },
        body: JSON.stringify(storyData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error updating story');
        }
    }
    )
}

function getStories() {
    let getStories = fetch(endpoint['story'])
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error getting stories');
        }
    }
    )
}

function getStory(_id) {
    stories = getStories();
    for (story of stories) {
        if (story._id == _id) {
            return story;
        }
    }
    return null;
}

function createComment(commentData) {
    let createComment = fetch(endpoint['comment'],
    {
        method: 'PUT',
        headers: {
            'content-type':'application/json'
        },
        body: JSON.stringify(commentData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error creating comment');
        }
    } 
    )
}
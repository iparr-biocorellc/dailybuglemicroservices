// front end JS for daily bugle app
const endpoint = {};
endpoint['story'] = 'http://localhost:8001/api/dailybugle/story';
endpoint['comment'] = 'http://localhost:8001/api/dailybugle/comment';
endpoint['auth'] = 'http://localhost:8001/dailybugle/auth';
endpoint['ad'] = 'http://localhost:8001/ad/dailybugle/';

function initPage() {    
    loadContent('main');
}


async function loadContent(view, _id, searchTerm=null) {
    await recordView();
    const authToken = localStorage.getItem('authToken');
    switch(view) {
        case 'main':
            getAuthorization()
            .then((authorization) => {
                loadStories(searchTerm).then(() => {
                    showHideButtons(authToken, authorization.role, true);
                });
            });
            break;
        case 'single':
            getAuthorization()
            .then((authorization) => {
                if (authorization.role === 'reader' || authorization.role === 'author') {
                    loadStory(_id).then(() => {
                        resetEdit(authorization.role);
                        showHideButtons(authToken, authorization.role);
                    });
                }
            });
            break;
        case 'new':
            getAuthorization()
            .then((authorization) => {
                if (authorization.role === 'author') {
                    newStory();
                }
            });
            break;
        default:
            break;
    }
}

function search() {
    var searchTerm = document.getElementById('search_input').value.toLowerCase();
    loadContent('main', null, searchTerm);
}

function editStory() {
    document.getElementById('edit_button').style.display = 'none';
    document.getElementById('submit_edit_button').style.display = 'block';
    document.getElementById('cancel_edit_button').style.display = 'block';
    document.getElementById('main_story').contentEditable = true;
    document.getElementById('teaser').contentEditable = true;
}

function resetEdit(role) {
    if (role === 'author') {
        document.getElementById('delete_button').style.display = 'block';
        document.getElementById('edit_button').style.display = 'block';
        document.getElementById('teaser_div').style.display = 'block';
    } else {
        document.getElementById('delete_button').style.display = 'none';
        document.getElementById('edit_button').style.display = 'none';
        document.getElementById('teaser_div').style.display = 'none';
    }
    document.getElementById('submit_edit_button').style.display = 'none';
    document.getElementById('cancel_edit_button').style.display = 'none';
    document.getElementById('main_story').contentEditable = false;
    document.getElementById('teaser').contentEditable = false;
}

async function submitEdit(_id, date) {
    const storyData = {
        "_id": _id,
        "title": document.getElementById('main_story').getElementsByTagName('h1')[0].innerHTML,
        "story": document.getElementById('main_story').getElementsByTagName('p')[0].innerHTML,
        "teaser": document.getElementById('teaser').innerHTML,
        "metadata": {
            "date": date,
            "author": localStorage.getItem('username'),
            "edited_date": new Date().toLocaleDateString(),
        }
    };
    await updateStory(storyData);
    loadContent('single', _id); 
}


function newStory() {
    document.getElementById('main_story').innerHTML = `
        <h1>Enter title here...</h1>
        <p>Enter story here...</p>
    `;
    const metadataHTML = `
        <div id="teaser_div" class="teaser">
            <h3>Teaser:</h3>
            <p id="teaser">Enter teaser here...</p>
        </div>
        <div class="metadata">
            <button id="cancel_edit_button" class="edit_submit_button" onclick="loadContent('main')">Cancel</button>
            <button id="submit_edit_button" class="edit_submit_button" onclick="submitNewStory()">Submit</button>
        </div>
    `;
    document.getElementById('sub_story_div').innerHTML = metadataHTML;
    document.getElementById('main_story').contentEditable = true;
    document.getElementById('teaser').contentEditable = true;
}

async function submitNewStory() {
    auth = await getAuthorization();
    if (auth.role !== 'author') {
       loadContent('main');
       return; 
    }
    const storyData = {
        "title": document.getElementById('main_story').getElementsByTagName('h1')[0].innerHTML,
        "story": document.getElementById('main_story').getElementsByTagName('p')[0].innerHTML,
        "teaser": document.getElementById('teaser').innerHTML,
        "comments": [ ],
        "metadata": {
            "date": new Date().toLocaleDateString(),
            "author": localStorage.getItem('username'),
            "edited_date": new Date().toLocaleDateString(),
        }
    };
    response = await createStory(storyData);
    id = response._id;
    loadContent('single', id);
}


async function loadStory(_id) {
    // Load metadata
    let storyData = await getStory(_id);
    document.getElementById('main_story').innerHTML = `
        <h1>${storyData.title}</h1>
        <p>${storyData.story}</p>
    `;
    const metadataHTML = `
        <div id="teaser_div" class="teaser">
            <h3>Teaser:</h3>
            <p id="teaser">${storyData.teaser}</p>
        </div>
        <div class="metadata">
            <button id="delete_button" class="edit_submit_button" onclick="deleteStoryLoadMain('${storyData._id}')">Delete</button>
            <button id="edit_button" class="edit_submit_button" onclick="editStory()">Edit</button>
            <button id="cancel_edit_button" class="edit_submit_button" onclick="loadContent('single', '${storyData._id}')">Cancel</button>
            <button id="submit_edit_button" class="edit_submit_button" onclick="submitEdit('${storyData._id}', '${storyData.metadata.date}')">Submit</button>
            <p class="metadata_padding">Date: ${storyData.metadata.date}</p>
            <p class="metadata_padding">Author: ${storyData.metadata.author}</p>
            ${storyData.metadata.edited_date ? `<p class="metadata_padding">Edited Date: ${storyData.metadata.edited_date}</p>` : ''}
        </div>
    `;
    document.getElementById('sub_story_div').innerHTML = metadataHTML;

    // Load comments
    if (storyData.comments && storyData.comments.length > 0) {
        const commentsHTML = `
            <div class="comments">
                <h2>Comments</h2>
                <ul>
                    ${storyData.comments.map(comment => `
                        <li>
                            <p><strong>${comment.user}</strong>: ${comment.comment_text}</p>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="new_comment">
                <h2>New Comment</h2>
                <textarea id="comment_text_input" placeholder="Enter your comment"></textarea>
                <button onclick="submitComment('${storyData._id}')">Submit</button>
            </div>
        `;
        document.getElementById('sub_story_div').innerHTML += commentsHTML;
    } else {
        const commentsHTML = `
            <div class="comments">
                <h2>Comments</h2>
                <p>No comments yet</p>
            </div>
            <div class="new_comment">
                <h2>New Comment</h2>
                <textarea id="comment_text_input" placeholder="Enter your comment"></textarea>
                <button onclick="submitComment('${storyData._id}')">Submit</button>
            </div>
        `;
        document.getElementById('sub_story_div').innerHTML += commentsHTML;
    }
}

async function submitComment(_id) {
    const commentText = document.getElementById('comment_text_input').value;
    const commentData = {
        "comment_text": commentText,
        "user": localStorage.getItem('username'),
        "_id": _id
    };
    await createComment(commentData);
    loadContent('single', _id);
}


async function loadStories(searchTerm=null) {
    let stories = await getStories();
    // Assuming stories is an array of story objects
    // Shuffle the array to randomize the order
    let shuffledStories; // Declare shuffledStories outside the if-else block

    if (searchTerm !== null) {
        storyID = await getStoryID(searchTerm);
            shuffledStories = shuffleArray(stories, storyID);
    } else {
        shuffledStories = shuffleArray(stories);
        }
    // Select the first three stories
    const mainStory = shuffledStories[0];

    // Load the stories into the HTML elements
    document.getElementById('main_story').innerHTML = `
        <h1 onclick="loadContent('single', '${mainStory._id}')">${mainStory.title}</h1>
        <p>${mainStory.story}</p>
    `;
    document.getElementById('sub_story_div').innerHTML = '';
    // Loop through the rest of the stories and create HTML elements for each one to insert inside the sub_story_div
    for (let i = 1; i < shuffledStories.length; i++) {
        const story = shuffledStories[i];
        document.getElementById('sub_story_div').innerHTML += `
            <article class="story">
                <h3 onclick="loadContent('single', '${story._id}')">${story.title}</h3>
                <p>${story.teaser}</p>
            </article>
        `;
    }

}

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array, setTopID = null) {
    // Shuffle the entire array
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    // If setTopID is provided, move the corresponding story to the first position
    if (setTopID !== null) {
        const topIndex = array.findIndex((story) => story._id === setTopID);
        if (topIndex !== -1 && topIndex !== 0) {
            // Swap the story at topIndex with the story at index 0
            [array[0], array[topIndex]] = [array[topIndex], array[0]];
        }
    }
    return array;
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

async function deleteStoryLoadMain(_id) {
    await deleteStory(_id);
    loadContent('main');
}

async function deleteStory(_id) {
    auth = await getAuthorization();
    if (auth.role !== 'author') {
        loadContent('main');
        return; 
    }
    let deleteStory = fetch(endpoint['story'],
    {
        method: 'DELETE',
        headers: {
            'content-type':'application/json'
        },
        body: JSON.stringify({"_id": _id})
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

async function getStories() {
  // Assuming fetch is asynchronous and returns a Promise
  try {
        const response = await fetch(endpoint['story']);
        const stories = await response.json();
        return stories;
    } catch (error) {
        console.error('Error fetching stories:', error);
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
}

async function getStory(_id) {
    const stories = await getStories();
    for (const story of stories) {
        if (story._id == _id) {
            return story;
        }
    }
    return null;
}


async function getStoryID(searchTerm) {
    const stories = await getStories();
    for (story of stories) {
        if (story.title.toLowerCase().includes(searchTerm)) {
            return story._id;
        }
    }
    return null;
}

async function createComment(commentData) {
    fetch(endpoint['comment'], {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        // Handle errors
        console.error('Error:', error);
    });
}

async function createStory(storyData) {
    return fetch(endpoint['story'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        // Handle errors
        console.error('Error:', error);
    });
}



// AUTH

async function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    loadContent('main');
  }

async function login(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
  
    const username = document.getElementById('username_login').value;
    const password = document.getElementById('password_login').value;
    const loginResult = await loginUser(username, password);
  
    if (loginResult.success) {
      document.getElementById('loginFormMessage').innerHTML = 'Login successful';
      closeLoginForm();
      loadContent('main');
    } else {
      document.getElementById('loginFormMessage').innerHTML = 'Login failed: ' + loginResult.error;
    }
  }

async function register(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
  
    const username = document.getElementById('username_register').value;
    const password1 = document.getElementById('password1_register').value;
    const password2 = document.getElementById('password2_register').value;
  
    // Get the selected role from the radio buttons
    const roleElements = document.getElementsByName('role');
    let selectedRole = 'reader'; // Default to 'reader' if no role is selected
  
    roleElements.forEach((roleElement) => {
      if (roleElement.checked) {
        selectedRole = roleElement.value;
      }
    });
  
    if (password1 !== password2) {
      document.getElementById('registrationFormMessage').innerHTML = 'Passwords do not match';
      return;
    }
  
    const registrationResult = await registerUser(username, password1, selectedRole);
  
    if (registrationResult.result === 1) {
      document.getElementById('registrationFormMessage').innerHTML = 'Registration successful';
      // Login user
      const loginResult = await loginUser(username, password1);
        if (loginResult.success) {
            document.getElementById('loginFormMessage').innerHTML = 'Login successful';
            closeRegisterForm();
            loadContent('main');
        } else {
            document.getElementById('loginFormMessage').innerHTML =
            'Login failed: ' + loginResult.error;
        }
    } else {
      document.getElementById('registrationFormMessage').innerHTML =
        'Registration failed: ' + registrationResult.error;
    }
  }
  


async function registerUser(username, password, role) {
    const response = await fetch('http://localhost:8001/dailybugle/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }), // Include the role parameter in the request body
    });
  
    return await response.json();
  }
  

  async function loginUser(username, password) {
    try {
      const response = await fetch('http://localhost:8001/dailybugle/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
  
        // Store the token in localStorage
        localStorage.setItem('authToken', data.token);
        // Store the username
        localStorage.setItem('username', username);
        
        // Return an indication of successful login
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Internal Server Error' };
    }
  }

  async function getAuthorization() {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
  
    // If there's no token, return the role as 'anonymous'
    if (!token) {
      return { role: 'anonymous' };
    }
  
    try {
      // Make a fetch request to the /authorization endpoint
      const response = await fetch('http://localhost:8001/dailybugle/auth/authorization', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
  
      if (response.ok) {
        // Parse the response and return the role
        const data = await response.json();
        return { role: data.role };
      } else {
        // Handle error response
        const errorData = await response.json();
        return { error: errorData.error };
      }
    } catch (error) {
      console.error(error);
      return { error: 'Internal Server Error' };
    }
  }
  
  function openLoginForm() {
    document.getElementById('login_modal').style.display = 'block';
}


function closeLoginForm() {
    document.getElementById('login_modal').style.display = 'none';
}

function openRegisterForm() {
    document.getElementById('register_modal').style.display = 'block';
}

function closeRegisterForm() {
    document.getElementById('register_modal').style.display = 'none';
}

function showHideButtons(authToken, role, edit=false) {
    if (authToken) {
      document.getElementById('username_display').innerHTML = localStorage.getItem('username');
      document.getElementById('login_button').style.display = 'none';
      document.getElementById('register_button').style.display = 'none';
      document.getElementById('logout_button').style.display = 'block';
    } else {
        document.getElementById('username_display').innerHTML = '';
        document.getElementById('login_button').style.display = 'block';
        document.getElementById('register_button').style.display = 'block';
        document.getElementById('logout_button').style.display = 'none';
    }
    if (role === 'author') {
        document.getElementById('new_story_button').style.display = 'block';
    } else {
        document.getElementById('new_story_button').style.display = 'none';
    }
    if (edit) {
        document.getElementById('main_story').contentEditable = false;
    }
}

function getUsername() {
    return localStorage.getItem('username') || 'anonymous';  // Default value if not found
}

async function getIpAddress() {
    try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'Unknown';
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return 'Unknown';
    }
}

async function recordView() {
    // Retrieve the username and IP address dynamically
    const username = getUsername();
    const ipaddress = await getIpAddress();

    // Create a JSON object with view information
    var viewData = {
        event: 'view',
        username: username,
        ipaddress: ipaddress,
        userAgent: navigator.userAgent
    };

    // You can implement the logic to send the viewData object to the server or do other actions
    await createAdView(viewData);
}

async function recordClick() {
    // Retrieve the username and IP address dynamically
    const username = getUsername();
    const ipaddress = await getIpAddress();

    // Create a JSON object with click information
    var clickData = {
        event: 'click',
        username: username,
        ipaddress: ipaddress,
        userAgent: navigator.userAgent
    };
    await createAdView(clickData);

    // Open the image in a new tab
    var adImage = document.querySelector(".ad img");
    var imageSource = adImage.src;
    window.open(imageSource, '_blank');
}

async function createAdView(adData) {
    return fetch(endpoint['ad'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        // Handle errors
        console.error('Error:', error);
    });
}
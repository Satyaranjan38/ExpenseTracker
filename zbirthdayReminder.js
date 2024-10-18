const API_BASE_URL = 'https://railwaybackend-l1gq.onrender.com';  // Replace with your actual API base URL

let reminders = [];

// Generate random birthday wish
function generateWish() {
    const wishes = [
        "Wishing you a day filled with happiness and a year filled with joy. Happy birthday!",
        "Sending you smiles for every moment of your special day. Have a wonderful time and a very happy birthday!",
        "Hope your special day brings you all that your heart desires! Here's wishing you a day full of pleasant surprises. Happy birthday!",
        "Wishing you a beautiful day with good health and happiness forever. Happy birthday!",
        "It’s a smile from me to wish you a day that brings the same kind of happiness and joy that you bring to me. Happy birthday!",
        "On this wonderful day, I wish you the best that life has to offer! Happy birthday!",
        "I hope your special day will bring you lots of happiness, love, and fun. You deserve them a lot. Enjoy!",
        "Have a wonderful birthday. I wish your every day to be filled with lots of love, laughter, happiness, and the warmth of sunshine.",
        "May your birthday be filled with sunshine, smiles, laughter, and love.",
        "Happy birthday! I hope all your birthday wishes and dreams come true.",
        "Another adventure-filled year awaits you. Welcome it by celebrating your birthday with pomp and splendor. Wishing you a very happy and fun-filled birthday!",
        "May the joy that you have spread in the past come back to you on this day. Wishing you a very happy birthday!",
        "This birthday, I wish you abundant happiness and love. May all your dreams turn into reality and may lady luck visit your home today. Happy birthday to one of the sweetest people I’ve ever known.",
        "Count not the candles... see the lights they give. Count not the years, but the life you live. Wishing you a wonderful time ahead. Happy birthday.",
        "Forget the past; look forward to the future, for the best things are yet to come.",
        "Birthdays are a new start, a fresh beginning and a time to pursue new endeavors with new goals. Move forward with confidence and courage. You are a very special person. May today and all of your days be amazing!",
        "Your birthday is the first day of another 365-day journey. Be the shining thread in the beautiful tapestry of the world to make this year the best ever. Enjoy the ride.",
        "Be happy! Today is the day you were brought into this world to be a blessing and inspiration to the people around you. You are a wonderful person! May you be given more birthdays to fulfill all of your dreams!",
        "A wish for you on your birthday, whatever you ask may you receive, whatever you seek may you find, whatever you wish may it be fulfilled on your birthday and always. Happy birthday!",
        "Another year older, another year wiser. Happy birthday!",
        "May you be surrounded by love and all your favorite things today and always. Happy birthday!",
        "Here’s to another year of wonderful experiences, great friends, and lasting memories. Happy birthday!",
        "May your birthday bring you as much joy as you bring others. You deserve the best day and the best year.",
        "Happy birthday! May your day be filled with laughter, joy, and all the good things you deserve.",
        "Wishing you a birthday filled with love, laughter, and all your heart's desires!",
        "On your birthday, I wish you a year filled with exciting new opportunities, lots of happiness, and great memories. Happy birthday!",
        "Wishing you a day as special as you are. Happy birthday!",
        "May your birthday be the start of a year filled with good luck, good health, and much happiness. Happy birthday!",
        "Wishing you a fantastic birthday and a wonderful year ahead. Make every day count!",
        "May your birthday be full of surprises, blessings, and lots of fun. Have a great one!",
        "Sending you all my love on your birthday. I hope your day is as amazing as you are!",
        "Happy birthday! May your day be filled with lots of love and happiness.",
        "Wishing you a year that’s as amazing as you are. Happy birthday!",
        "May all your dreams and wishes come true. Happy birthday!",
        "May your birthday be as wonderful and extraordinary as you are. Happy birthday!",
        "Wishing you a birthday filled with sweet moments and wonderful memories to cherish always!",
        "Happy birthday! I hope your special day brings you everything your heart desires.",
        "Wishing you all the best on your special day. Happy birthday!",
        "May your birthday be the start of a year filled with good fortune, good health, and happiness. Happy birthday!",
        "Wishing you a beautiful day and an even more beautiful year ahead. Happy birthday!",
        "May you have a fantastic day and many more to come. Happy birthday!",
        "Wishing you a wonderful birthday and a year filled with blessings. Happy birthday!",
        "May your birthday be filled with love, joy, and laughter. Happy birthday!",
        "Here’s to another year of amazing adventures and unforgettable memories. Happy birthday!",
        "Happy birthday! Wishing you a day filled with love and laughter.",
        "May your special day be filled with happiness, love, and laughter. Happy birthday!",
        "Wishing you all the happiness in the world on your birthday. Have a great day!",
        "Happy birthday! May your day be filled with lots of love, joy, and cake.",
        "On your special day, I wish you all the happiness, love, and blessings in the world. Happy birthday!",
        "Wishing you a day filled with love, joy, and endless blessings. Happy birthday!",
        "Happy birthday! May all your dreams and wishes come true.",
        "Wishing you a birthday as bright and wonderful as you are. Happy birthday!",
        "May your birthday be filled with laughter, love, and all your favorite things. Happy birthday!",
        "Happy birthday! I hope your day is as amazing as you are.",
        "May your birthday be as special as you are. Happy birthday!",
        "Wishing you a birthday filled with love, laughter, and all your heart's desires!",
        "May your birthday bring you as much joy as you bring others. Happy birthday!",
        "On your birthday, I wish you a year filled with exciting new opportunities, lots of happiness, and great memories. Happy birthday!",
        "Wishing you a day as special as you are. Happy birthday!",
        "May your birthday be the start of a year filled with good luck, good health, and much happiness. Happy birthday!",
        "Wishing you a fantastic birthday and a wonderful year ahead. Make every day count!",
        "May your birthday be full of surprises, blessings, and lots of fun. Have a great one!",
        "Sending you all my love on your birthday. I hope your day is as amazing as you are!",
        "Happy birthday! May your day be filled with lots of love and happiness.",
        "Wishing you a year that’s as amazing as you are. Happy birthday!",
        "May all your dreams and wishes come true. Happy birthday!",
        "May your birthday be as wonderful and extraordinary as you are. Happy birthday!",
        "Wishing you a birthday filled with sweet moments and wonderful memories to cherish always!",
        "Happy birthday! I hope your special day brings you everything your heart desires.",
        "Wishing you all the best on your special day. Happy birthday!",
        "May your birthday be the start of a year filled with good fortune, good health, and happiness. Happy birthday!",
        "Wishing you a beautiful day and an even more beautiful year ahead. Happy birthday!",
        "May you have a fantastic day and many more to come. Happy birthday!",
        "Wishing you a wonderful birthday and a year filled with blessings. Happy birthday!",
        "May your birthday be filled with love, joy, and laughter. Happy birthday!",
        "Here’s to another year of amazing adventures and unforgettable memories. Happy birthday!",
        "Happy birthday! Wishing you a day filled with love and laughter.",
        "May your special day be filled with happiness, love, and laughter. Happy birthday!",
        "Wishing you all the happiness in the world on your birthday. Have a great day!",
        "Happy birthday! May your day be filled with lots of love, joy, and cake.",
        "On your special day, I wish you all the happiness, love, and blessings in the world. Happy birthday!",
        "Wishing you a day filled with love, joy, and endless blessings. Happy birthday!",
        "Happy birthday! May all your dreams and wishes come true.",
        "Wishing you a birthday as bright and wonderful as you are. Happy birthday!",
        "May your birthday be filled with laughter, love, and all your favorite things. Happy birthday!",
        "Happy birthday! I hope your day is as amazing as you are.",
        "May your birthday be as special as you are. Happy birthday!",
        "Wishing you a birthday filled with love, laughter, and all your heart's desires!",
        "May your birthday bring you as much joy as you bring others. Happy birthday!",
        "On your birthday, I wish you a year filled with exciting new opportunities, lots of happiness, and great memories. Happy birthday!",
        "Wishing you a day as special as you are. Happy birthday!",
        "May your birthday be the start of a year filled with good luck, good health, and much happiness. Happy birthday!",
        "Wishing you a fantastic birthday and a wonderful year ahead. Make every day count!",
        "May your birthday be full of surprises, blessings, and lots of fun. Have a great one!"
    ];
    
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    document.getElementById('wish').value = randomWish;
}

// Handle form submission to add a reminder
document.getElementById('reminderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const userName = localStorage.getItem('userName'); 
    
    const personName = document.getElementById('name').value;
    const date = document.getElementById('birthday').value;
    const wish = document.getElementById('wish').value;

    const reminder = { personName, date, wish, userName };

    // Add reminder to the database via API
    fetch(`${API_BASE_URL}/addReminder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminder)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add reminder');
        }
        return response.json();
    })
    .then(data => {
        // Assuming the API returns the added reminder with its ID
        const newReminder = {
            id: data.id,
            personName: data.personName,
            date: data.date,
            wish: data.wish || "No wish set" // Handle case where wish might be undefined
        };
        reminders.push(newReminder); // Add reminder to local array
        displayReminders(); // Refresh displayed reminders
        document.getElementById('reminderForm').reset(); // Clear form fields
    })
    .catch(error => console.error('Error:', error));
});


// Function to display reminders in a table
// Function to display reminders in a table
function displayReminders() {
    const remindersTableBody = document.getElementById('remindersTableBody');
    remindersTableBody.innerHTML = '';

    reminders.forEach((reminder) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = reminder.personName || "Not Set"; // Handle null values
        
        const birthdayCell = document.createElement('td');
        birthdayCell.textContent = reminder.date || "Not Set"; // Handle null values
        
        const wishCell = document.createElement('td');
        wishCell.textContent = reminder.wish || "No Wish Set"; // Handle null values

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteReminder(reminder.id);
        };
        actionCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(birthdayCell);
        row.appendChild(wishCell);
        row.appendChild(actionCell);

        remindersTableBody.appendChild(row);
    });
}


// Fetch all reminders for the user when the DOM is loaded
window.onload = function() {
    const userName = localStorage.getItem('userName'); // Get user name from local storage
    if (userName) {
        fetchReminders(userName);

    } else {
        console.error('User name not found in local storage.');
    }
};

// Fetch all reminders for the user
function fetchReminders(userName) {
    fetch(`${API_BASE_URL}/fetchReminder/${userName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            // Assuming `data` is the array of reminders directly
            if (Array.isArray(data)) {
                reminders = data.map(reminder => ({
                    id: reminder.id, 
                    personName: reminder.personName || "Not Set", 
                    date: reminder.date || "Not Set"
                    // wish: reminder.wish || "No Wish Set"
                }));
                
                console.log("Reminders loaded successfully.");
                displayReminders(); // Display the loaded reminders
            } else {
                console.error('Unexpected response structure:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching reminders:', error);
        });
}


// Delete a reminder by ID
function deleteReminder(id) {
    fetch(`${API_BASE_URL}/deleteReminder/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            reminders = reminders.filter(reminder => reminder.id !== id); // Remove deleted reminder from local array
            displayReminders(); // Refresh displayed reminders
        } else {
            console.error('Failed to delete reminder.');
        }
    })
    .catch(error => console.error('Error:', error));
}

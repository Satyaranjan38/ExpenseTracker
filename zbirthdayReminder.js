const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com'; // Replace with your actual API base URL

let reminders = [];

// Generate random birthday wish
function generateWish() {
    const wishes = [
        "Wishing you a day filled with love and cheer. Happy Birthday!",
        "May your birthday be as special as you are. Happy Birthday!",
        "Hope your special day brings you all that your heart desires!",
        "Happy Birthday! Wishing you a wonderful year ahead.",
        "May all your wishes come true on your special day."
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

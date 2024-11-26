document.addEventListener('DOMContentLoaded', () => {
   // const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com';// Replace with your actual API base URL
    // const API_BASE_URL = 'https://railwaybackend2.onrender.com';
    //const API_BASE_URL = 'http://localhost:8086';
    const reminderForm = document.getElementById('reminder-form');
    const remindersTableBody = document.getElementById('remindersTableBody');
    let API_BASE_URL = '';

const API_BASE_URL_1 = 'https://railwaybackend-l1gq.onrender.com'; // Primary URL
// const API_BASE_URL_1 = 'https://railwaybackend-ludo.onrender.com';
const API_BASE_URL_2 = 'https://railwaybackend-l1gq.onrender.com'; // Backup URL
 //  const API_BASE_URL_2 = 'https://railwaybackend-ludo.onrender.com'; // Backup URL
let currentBaseUrl = API_BASE_URL_1; // Initially set to the primary URL

async function checkServiceStatus() {
    try {
        // Fetch the status from the current URL
        const response = await fetch(`${currentBaseUrl}/welcome`);

        // Check if the status code is 503 (Service Unavailable)
        if (response.status === 503) {
            console.log(`Service at ${currentBaseUrl} is unavailable (503). Switching to the backup URL.`);
            // Switch to the backup URL
            currentBaseUrl = currentBaseUrl === API_BASE_URL_1 ? API_BASE_URL_2 : API_BASE_URL_1;
            API_BASE_URL = currentBaseUrl;
        } else {
            // Otherwise, handle the response as text (assuming it's plain text)
            const data = await response.text();

            // Check if the response contains the "suspend" keyword
            if (data.toLowerCase().includes('suspend')) {
                console.log(`Service at ${currentBaseUrl} is suspended. Switching to the backup URL.`);
                // Switch to the backup URL
                currentBaseUrl = currentBaseUrl === API_BASE_URL_1 ? API_BASE_URL_2 : API_BASE_URL_1;
                API_BASE_URL = currentBaseUrl;
            } else {
                console.log(`Service at ${currentBaseUrl} is running normally.`);
                API_BASE_URL = currentBaseUrl;
            }
        }
    } catch (error) {
        console.error('Error checking service status:', error);
        // If there's an error (e.g., network error), switch to the backup URL as a fallback
        currentBaseUrl = currentBaseUrl === API_BASE_URL_1 ? API_BASE_URL_2 : API_BASE_URL_1;
        API_BASE_URL = currentBaseUrl;
    }
}

    // Event listener for form submission
    reminderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addReminder();
    });

    // Function to add a new reminder
    async function addReminder() {
        const title = document.getElementById('reminder-title').value;
        const date = document.getElementById('reminder-date').value;
        const userName = localStorage.getItem('userName');
        const category = document.getElementById('catagory').value;
        

        fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, date, userName, category }),
        })
        .then(response => response.json())
        .then(reminder => {
            displayReminders(); // Refresh the list of reminders after adding
            reminderForm.reset(); // Reset the form
        })
        .catch(error => console.error('Error adding reminder:', error));
    }

    // Function to display all reminders for the current user
    async function displayReminders() {
        const userName = localStorage.getItem('userName');

        await checkServiceStatus();
        fetch(`${API_BASE_URL}/reminders/${userName}`)
            .then(response => response.json())
            .then(reminders => {
                remindersTableBody.innerHTML = ''; // Clear existing table rows
                reminders.forEach(reminder => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${reminder.title}</td>
                        <td>${new Date(reminder.date).toLocaleString()}</td>
                        <td>${reminder.category}</td>
                        <td><button onclick="deleteReminder('${reminder.id}')">Delete</button></td>
                    `;
                    remindersTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching reminders:', error));
    }

    // Function to delete a reminder by ID
    function deleteReminder(reminderId) {
        fetch(`${API_BASE_URL}/reminders/${reminderId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                displayReminders(); // Refresh the list of reminders after deletion
            } else {
                console.error('Failed to delete reminder:', response.statusText);
            }
        })
        .catch(error => console.error('Error deleting reminder:', error));
    }

    // Expose deleteReminder to the global scope so it can be called from the HTML
    window.deleteReminder = deleteReminder;

    // Load and display reminders when the page loads
    displayReminders();
});

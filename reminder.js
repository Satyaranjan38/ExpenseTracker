document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com'; // Replace with your actual API base URL
    //const API_BASE_URL = 'http://localhost:8086';
    const reminderForm = document.getElementById('reminder-form');
    const remindersTableBody = document.getElementById('remindersTableBody');
    
    // Event listener for form submission
    reminderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addReminder();
    });

    // Function to add a new reminder
    function addReminder() {
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
    function displayReminders() {
        const userName = localStorage.getItem('userName');
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

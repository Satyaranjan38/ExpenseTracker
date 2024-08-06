document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://MovieSearch.cfapps.us10-001.hana.ondemand.com'; // Replace with your actual API base URL
    const reminderForm = document.getElementById('reminder-form');
    const remindersTableBody = document.getElementById('remindersTableBody');
    const category = document.getElementById('category') ; 

    reminderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addReminder();
    });

    function addReminder() {
        const title = document.getElementById('reminder-title').value;
        const date = document.getElementById('reminder-date').value;
        const userName = localStorage.getItem('userName');

        fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, date, userName , category }),
        })
        .then(response => response.json())
        .then(reminder => {
            displayReminders();
            reminderForm.reset();
        })
        .catch(error => console.error('Error adding reminder:', error));
    }

    function displayReminders() {
        const userName = localStorage.getItem('userName');
        fetch(`${API_BASE_URL}/reminders/${userName}`)
            .then(response => response.json())
            .then(reminders => {
                remindersTableBody.innerHTML = '';
                reminders.forEach(reminder => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${reminder.title}</td>
                        <td>${new Date(reminder.date).toLocaleString()}</td>
                        <td>${reminder.category}</td>
                        <td><button onclick="deleteReminder(${reminder.id})">Delete</button></td>
                    `;
                    remindersTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching reminders:', error));
    }

    window.deleteReminder = (id) => {
        if (confirm("Are you sure you want to delete this reminder?")) {
            fetch(`${API_BASE_URL}/reminders/${id}`, {
                method: 'DELETE',
            })
            .then(() => {
                displayReminders();
            })
            .catch(error => console.error('Error deleting reminder:', error));
        }
    };

    displayReminders();
});

const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com';
const FRIENDS_API_URL = 'https://imageocr-nsnb.onrender.com/getFriendsByUserName?user_name=satyaranjanparida038@gmail.com';


function showLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('active');
    loader.style.display = 'flex';
}

// Function to hide the loader
function hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.remove('active');
    loader.style.display = 'none';
}
// Load groups for dropdowns
function loadGroups() {
    showLoader();
    
    const userName =  localStorage.getItem('userName') ; 
    fetch(`${API_BASE_URL}/api/groups/${userName}`)
        .then(response => response.json())
        .then(groups => {
            const groupDropdown = document.getElementById('groupDropdown');
            const groupDropdownRemove = document.getElementById('groupDropdownRemove');
            const groupTransactionDropdown = document.getElementById('groupTransactionDropdown');
             const groupSelect = document.getElementById('groupSelect');

            // Clear existing options
            groupDropdown.innerHTML = '<option value="" disabled selected>Select Group</option>';
            groupDropdownRemove.innerHTML = '<option value="" disabled selected>Select Group</option>';
            groupTransactionDropdown.innerHTML = '<option value="" disabled selected>Select Group</option>';
            groupSelect.innerHTML = '';

            // Populate dropdowns with groups
            groups.forEach(group => {
                const option = new Option(group.name, group.id);
                groupDropdown.add(option);

                const optionRemove = new Option(group.name, group.id);
                groupDropdownRemove.add(optionRemove);

                const optionTransaction = new Option(group.name, group.id);
                groupTransactionDropdown.add(optionTransaction);

              

                // const optionSelect = new Option(group.name, group.id);
                // groupSelect.add(optionSelect);

                const groupBox = document.createElement('div');
                groupBox.className = 'group-box';

                const groupName = document.createElement('span');
                groupName.textContent = group.name;
                groupName.onclick = () => loadGroupTransactions(group.id);
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => deleteGroup(group.id);

                groupBox.appendChild(groupName);
                groupBox.appendChild(deleteButton);
                groupSelect.appendChild(groupBox);
            });
            hideLoader();
        })
        .catch(error => console.error('Error loading groups:', error));
}

// document.getElementById('groupSelect').addEventListener('change', function() {
//     const groupId = this.value;

//     if (groupId) {
//         loadGroupTransactions(groupId);
//     }
// });


// Call loadGroupMembers(groupId) with the appropriate group ID
function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
        fetch(`${API_BASE_URL}/api/groups/${groupId}`, { method: 'DELETE' })
            .then(() => {
                alert('Group deleted successfully.');
                loadGroups(); // Reload groups after deletion
            })
            .catch(error => console.error('Error deleting group:', error));
    }
}

function loadGroupMembers(groupId) {
    fetch(`${API_BASE_URL}/api/groups/groupMembers/${groupId}`)
        .then(response => response.json())
        .then(data => {
            const emailDropdown = document.getElementById('userEmailRemove');

            // Clear existing options
            emailDropdown.innerHTML = '<option value="" disabled selected>Select Email</option>';

            // Parse the JSON strings and extract email addresses
            data.forEach(item => {
                try {
                    const parsedItem = JSON.parse(item);
                    const email = parsedItem.email;
                    
                    // Create a new option element
                    const option = document.createElement('option');
                    option.value = email;
                    option.textContent = email;
                    emailDropdown.appendChild(option);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            });
        })
        .catch(error => console.error('Error loading group members:', error));
}

// Event listener for group dropdown change
document.getElementById('groupDropdownRemove').addEventListener('change', function() {
    const groupId = this.value;
    if (groupId) {
        loadGroupMembers(groupId);
    }
});

// Call loadGroups() when the page loads
document.addEventListener('DOMContentLoaded', loadGroups);

// Load emails for the dropdown
function loadEmails() {
    fetch('https://imageocr-nsnb.onrender.com/getFriendsByUserName?user_name=satyaranjanparida038@gmail.com')
        .then(response => response.json())
        .then(data => {
            const emailDropdown = document.getElementById('userEmail');
            
            // Clear existing options
            emailDropdown.innerHTML = '<option value="" disabled selected>Select Email</option>';
            
            // Check if friend_names exists and is an array
            if (Array.isArray(data.friend_names)) {
                data.friend_names.forEach(email => {
                    const option = document.createElement('option');
                    option.value = email;
                    option.textContent = email;
                    emailDropdown.appendChild(option);
                });
            } else {
                console.error('Invalid data format:', data);
            }
        })
        .catch(error => console.error('Error loading emails:', error));
}

// Call loadEmails() when the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', loadEmails);



// Create a new group
document.getElementById('createGroupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const groupName = document.getElementById('groupName').value;
    const userName =  localStorage.getItem('userName') ; 
    fetch(`${API_BASE_URL}/api/groups/${userName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Group created:', data);
        loadGroups(); // Refresh the dropdowns
    })
    .catch(error => console.error('Error creating group:', error));

    this.reset();
});

// Add a user to a group
document.getElementById('addUserForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const groupId = document.getElementById('groupDropdown').value;
    const userEmail = document.getElementById('userEmail').value;

    if (!groupId) {
        alert('Please select a group.');
        return;
    }

    fetch(`${API_BASE_URL}/api/groups/${groupId}/addUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
    })
    .then(response => response.json())
    .then(data => {
        console.log('User added successfully:', data);
    })
    .catch(error => console.error('Error adding user:', error));

    this.reset();
});

// Remove a user from a group
document.getElementById('removeUserForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const groupId = document.getElementById('groupDropdownRemove').value;
    const userEmail = document.getElementById('userEmailRemove').value;

    if (!groupId) {
        alert('Please select a group.');
        return;
    }

    fetch(`${API_BASE_URL}/api/groups/${groupId}/removeUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
    })
    .then(response => response.json())
    .then(data => {
        console.log('User removed successfully:', data);
    })
    .catch(error => console.error('Error removing user:', error));

    this.reset();
});

// Add a transaction to a group
document.getElementById('groupTransactionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const groupId = document.getElementById('groupTransactionDropdown').value;
    const personName = document.getElementById('personNameGroup').value;
    const amount = document.getElementById('amountGroup').value;
    const transactionType = document.getElementById('transactionTypeGroup').value;
    const date = document.getElementById('expenseDateGroup').value;
    const reason = document.getElementById('reasonGroup').value;

    if (!groupId) {
        alert('Please select a group.');
        return;
    }
    showLoader();

    fetch(`${API_BASE_URL}/api/groups/${groupId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personName, amount, transactionType, date, reason })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Transaction added successfully:', data);
        hideLoader();
        loadGroupTransactions(); // Refresh the transaction list
    })
    .catch(error => console.error('Error adding transaction:', error));
    hideLoader();

    this.reset();
});

function loadUserContainingGroups(){
    
    const userName =  localStorage.getItem('userName') ; 
    fetch(`${API_BASE_URL}/api/groups?userName=userName`)
        .then(response =>response.json())
        
}

// Load transactions for the selected group
function loadGroupTransactions(groupId) {
    
    showLoader();
    fetch(`${API_BASE_URL}/api/groups/${groupId}/transactions`)
        .then(response => response.json())
        .then(transactions => {
            const tableBody = document.querySelector('#groupTransactionsTable tbody');
            tableBody.innerHTML = '';

            transactions.forEach(transaction => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${transaction.groupName}</td>
                    <td>${transaction.personName}</td>
                    <td>${transaction.amount}</td>
                    <td>${transaction.reason}</td>
                    <td>${transaction.paid}</td>
                    <td>
                        <div class="dropdown">
                            <button class="dropbtn">Actions</button>
                            <div class="dropdown-content">
                                <a href="#" onclick="deleteTransaction('${transaction.id}')">Delete</a>
                                <a href="#" onclick="markAsPaid('${transaction.id}')">Paid</a>
                                <a href="#" onclick="notifyPerson('${transaction.id}', '${transaction.email}', '${transaction.transactionType}')">Notify</a>
                            </div>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            hideLoader();
        })
        .catch(error => console.error('Error loading transactions:', error));
}

// Delete a transaction
function deleteTransaction(id) {
    showLoader();
    fetch(`${API_BASE_URL}/api/groups/transactions/${id}`, { method: 'DELETE' })
        .then(() => loadGroupTransactions())
        .catch(error => console.error('Error deleting transaction:', error));
        hideLoader();
}

// Mark a transaction as paid
function markAsPaid(id) {
    showLoader();
    fetch(`${API_BASE_URL}/api/groups/transactions/${id}/markAsPaid`, { method: 'POST' })
        .then(() => loadGroupTransactions())
        .catch(error => console.error('Error marking transaction as paid:', error));
        hideLoader();
}

// Notify a person about a transaction
function notifyPerson(id, email, transactionType) {
    if (transactionType === 'lent') {
        alert("You cannot notify because you lent money");
        return;
    }
    if (email) {
        fetch(`${API_BASE_URL}/api/groups/transactions/${id}/notify`, { method: 'POST' })
            .then(() => alert('Notification sent!'))
            .catch(error => console.error('Error sending notification:', error));
    }
}



// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
    loadEmails(); // Load emails on page load
    // loadGroupTransactions();
});

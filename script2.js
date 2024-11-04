

// const API_BASE_URL = 'https://railwaybackend2.onrender.com'; 
// const API_BASE_URL2 = 'https://imageocr2.onrender.com'; 

const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com'; 
const API_BASE_URL2 = 'https://imageocr-nsnb.onrender.com';
const ctx = document.getElementById('transactionChart').getContext('2d');
const transactionChart = new Chart(ctx, {
    type: 'pie', 
    data: {
        labels: ['Lent', 'Owe'],
        datasets: [{
            label: 'Transactions',
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
            borderWidth: 1,
            data: [0, 0]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `${tooltipItem.label}: $${tooltipItem.raw}`;
                    }
                }
            }
        }
    }
});


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

document.getElementById('transactionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const personName = document.getElementById('personName').value;
    const amount = document.getElementById('amount').value;
    const transationType = document.getElementById('transactionType').value;
    const personEmail = emailInput.value || emailDropdown.value;
    const date = document.getElementById('expense-date').value;
    const userName = localStorage.getItem('userName');
    const reason = document.getElementById('reason').value;
    

    fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personName, amount, transationType, personEmail, date, userName, reason }),
    })
    .then(response => response.json())
    .then(transaction => {
        addTransactionToUI(transaction);
        updateChart();
    });

    this.reset();
});

function addTransactionToUI(transaction) {
    const transactionsTable = document.querySelector('#transactionsTable tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${transaction.personName}</td>
        <td>${transaction.amount}</td>
        <td>${transaction.transationType}</td>
        <td>${transaction.reason}</td>
        <td>${transaction.paid}</td>
        <td>
            <div class="dropdown">
                <button class="dropbtn">Actions</button>
                <div class="dropdown-content">
                    <!-- Correctly wrap the transaction.id in quotes -->
                    <a href="#" onclick="deleteTransaction('${transaction.id}')">Delete</a>
                    <a href="#" onclick="markAsPaid('${transaction.id}')">Paid</a>
                    <a href="#" onclick="notifyPerson('${transaction.id}', '${transaction.personEmail}', '${transaction.transationType}')">Notify</a>
                </div>
            </div>
        </td>
    `;
    transactionsTable.appendChild(tr);
}

function addTransactionToUI2(transaction) {
    const transactionsTable = document.querySelector('#transactionsTable tbody');
    let displayType;
    if (transaction.transationType === 'lent') {
        displayType = 'owe'; // Show 'Owe' if the transaction type is 'lent'
    } else if (transaction.transationType === 'owe') {
        displayType = 'lent'; // Show 'Lent' if the transaction type is 'owe'
    } else {
        displayType = transaction.transationType; // Fallback to the original type if it's neither
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${transaction.userName}</td>
        <td>${transaction.amount}</td>
        <td>${displayType}</td>
        <td>${transaction.reason}</td>
        <td>${transaction.paid}</td>
        <td>
            <div class="dropdown">
                <button class="dropbtn">Actions</button>
                <div class="dropdown-content">
                    <!-- Correctly wrap the transaction.id in quotes -->
                    <a href="#" onclick="deleteTransaction('${transaction.id}')">Delete</a>
                    <a href="#" onclick="markAsPaid('${transaction.id}')">Paid</a>
                    <!-- <a href="#" onclick="notifyPerson('${transaction.id}', '${transaction.personEmail}', '${transaction.transationType}')">Notify</a>-->
                </div>
            </div>
        </td>
    `;
    transactionsTable.appendChild(tr);
}


function deleteTransaction(id) {
    showLoader(); 
    fetch(`${API_BASE_URL}/api/transactions/${id}`, { method: 'DELETE' })
        .then(() => {
            document.querySelector(`#transactionsTable tbody`).innerHTML = '';
            hideLoader() ; 
            fetchTransactions();
        });
}

function markAsPaid(id) {
    showLoader();
    fetch(`${API_BASE_URL}/updateStatus/${id}`, { method: 'POST' })
        .then(() => {
            document.querySelector(`#transactionsTable tbody`).innerHTML = '';
            hideLoader() ; 
            fetchTransactions();
        });
}

function notifyPerson(id, email ,transationType ) {

    if(transationType==='lent'){
        alert("You can not notify because you lent money"); 
        return ;

    }
    if (email) {
        showLoader();
        fetch(`${API_BASE_URL}/postNotification/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
           
            
        });
        hideLoader() ; 
    } else {
        alert("No email provided for this person.");
    }
}

function fetchTransactions() {
    showLoader();
    const userName = localStorage.getItem('userName');
    
    // Fetch transactions for the current user
    fetch(`${API_BASE_URL}/api/transactions/${userName}`)
        .then(response => response.json())
        .then(transactions => {
            transactions.forEach(addTransactionToUI);
            
            // After processing the first API response, fetch transactions from another user
            fetch(`${API_BASE_URL}/checkFromOtherUser/${userName}`)
                .then(response => response.json())
                .then(otherUserTransactions => {
                    otherUserTransactions.forEach(addTransactionToUI2);
                    hideLoader();
                    updateChart();
                });
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
            hideLoader();
        });
}


function updateChart() {
    const userName = localStorage.getItem('userName');
    fetch(`${API_BASE_URL}/api/transactions/${userName}`)
    .then(response => response.json())
    .then(transactions => {
        const lentTotal = transactions.filter(t => t.transationType === 'lent').reduce((sum, t) => sum + t.amount, 0);
        const oweTotal = transactions.filter(t => t.transationType === 'owe').reduce((sum, t) => sum + t.amount, 0);

        transactionChart.data.datasets[0].data = [lentTotal, oweTotal];
        transactionChart.update();
    });
}

const generateCodeBtn = document.getElementById("generateCodeBtn");
    const generatedCodeInput = document.getElementById("generatedCode");
    const addFriendBtn = document.getElementById("addFriendBtn");
    const friendCodeInput = document.getElementById("friendCode");

    const USER_ID = localStorage.getItem('userName') // Replace with the actual user ID

    // Function to handle generating a friendship code
    function generateCode() {
        fetch(`${API_BASE_URL2}/generate_code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: USER_ID })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code) {
                generatedCodeInput.value = data.code;
            } else {
                alert("Failed to generate code");
            }
        })
        .catch(error => {
            console.error("Error generating code:", error);
            alert("An error occurred while generating the code");
        });
    }

    // Function to handle adding a friend
    function addFriend() {
        const friendCode = friendCodeInput.value;
        if (friendCode === "") {
            alert("Please enter your friend's code.");
            return;
        }

        fetch(`${API_BASE_URL2}/add_friend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: USER_ID, code: friendCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Friend added successfully!");
                fetchFriends();
            } else if (data.error) {
                alert("Error adding friend: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error adding friend:", error);
            alert("An error occurred while adding the friend");
        });
    }

    // Event listener for Generate Code button
    generateCodeBtn.addEventListener("click", generateCode);

    // Event listener for Add Friend button
    addFriendBtn.addEventListener("click", addFriend);

    const emailDropdown = document.getElementById('emailDropdown');
    const emailInput = document.getElementById('emailInput');
    
    // Function to fetch friends' emails from the API
    async function fetchFriends() {
        try {
            const userName = localStorage.getItem('userName');
            const response = await fetch(`${API_BASE_URL2}/getFriendsByUserName?user_name=${userName}`);
            const data = await response.json();
            const friends = data.friend_names;
            
            // Populate the dropdown with friends' emails
            friends.forEach(email => {
                const option = document.createElement('option');
                option.value = email;
                option.textContent = email;
                emailDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    }
    
    // Fetch friends on page load
    fetchFriends();
    // fetchTransactions() ; 
    
    // Handle changes in the dropdown
    emailDropdown.addEventListener('change', function() {
        emailInput.value = '';  // Clear custom email input if dropdown is used
        
    });
    
    // Handle input email
    emailInput.addEventListener('input', function() {
        emailDropdown.value = '';  // Clear dropdown selection if custom email is entered
    });


document.addEventListener('DOMContentLoaded', fetchTransactions , fetchFriends);

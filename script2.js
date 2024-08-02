// Initialize Chart.js chart
const ctx = document.getElementById('transactionChart').getContext('2d');
const transactionChart = new Chart(ctx, {
    type: 'pie', // Change type to 'pie'
    data: {
        labels: ['Lent', 'Owe'], // Pie chart labels
        datasets: [{
            label: 'Transactions',
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)', // Color for 'Lent'
                'rgba(75, 192, 192, 0.2)'  // Color for 'Owe'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
            data: [0, 0] // Initial data
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

// Handle form submission
document.getElementById('transactionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const personName = document.getElementById('personName').value;
    const amount = document.getElementById('amount').value;
    const transactionType = document.getElementById('transactionType').value;
    const personEmail = document.getElementById('email').value;
    const date = document.getElementById('expense-date').value;
    const userName = localStorage.getItem('userName');
    const reason = document.getElementById('reason').value;
    const API_BASE_URL = 'https://MovieSearch.cfapps.us10-001.hana.ondemand.com'; 

    fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personName, amount, transationType: transactionType, personEmail, date, userName, reason }),
    })
    .then(response => response.json())
    .then(transaction => {
        addTransactionToUI(transaction);
        updateChart();
    });

    // Reset form
    this.reset();
});

// Add transaction to the UI
function addTransactionToUI(transaction) {
    const transactionsList = document.getElementById('transactionsList');
    const li = document.createElement('li');
    li.className = transaction.type;
    li.innerHTML = `
        ${transaction.personName} - $${transaction.amount} - ${transaction.transationType} - ${transaction.reason}
        <button onclick="deleteTransaction(${transaction.id})">Delete</button>
    `;
    transactionsList.appendChild(li);
}

// Delete transaction
function deleteTransaction(id) {
    fetch(`${API_BASE_URL}/api/transactions/${id}`, { method: 'DELETE' })
        .then(() => {
            document.getElementById('transactionsList').innerHTML = '';
            fetchTransactions();
        });
}

// Fetch transactions from the server
function fetchTransactions() {
    const userName = localStorage.getItem('userName');
    fetch(`${API_BASE_URL}/api/transactions/${userName}`)
        .then(response => response.json())
        .then(transactions => {
            transactions.forEach(addTransactionToUI);
            updateChart();
        });
}

// Update the chart with new data
function updateChart() {
    const userName = localStorage.getItem('userName');
    fetch(`${API_BASE_URL}/api/transactions/${userName}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(transactions => {
        const lentTotal = transactions.filter(t => t.transationType === 'Lent').reduce((sum, t) => sum + t.amount, 0);
        const oweTotal = transactions.filter(t => t.transationType === 'Owe').reduce((sum, t) => sum + t.amount, 0);

        console.log(lentTotal);
        console.log(oweTotal);
        
        // Update chart data
        transactionChart.data.datasets[0].data = [lentTotal, oweTotal];
        transactionChart.update();
    })
    .catch(error => console.error('Fetch error:', error));
}

// Fetch transactions when the page loads
document.addEventListener('DOMContentLoaded', fetchTransactions);

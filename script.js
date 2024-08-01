document.addEventListener('DOMContentLoaded', () => {
    checkAuthorization() ; 
    displayUserName();

    
    const expenseForm = document.getElementById('expense-form');
    const budgetForm = document.getElementById('budget-form');
    const expensesList = document.getElementById('expenses');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
    const totalExpenseElement = document.getElementById('total-expense');
    const API_BASE_URL = 'https://MovieSearch.cfapps.us10-001.hana.ondemand.com'; 

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addExpense();
    });

    budgetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        setBudget();
    });

    function addExpense() {
        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const date = document.getElementById('expense-date').value;
        const catagory = document.getElementById('expense-category').value;
        const userName = localStorage.getItem('userName');

        fetch(`${API_BASE_URL}/expense`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, amount, date, catagory, userName }),
        })
        .then(response => response.json())
        .then(expense => {
            displayExpenses();
            updateChart();
            expenseForm.reset();
        })
        .catch(error => console.error('Error adding expense:', error));
    }

    function checkAuthorization() {
        const accessToken = localStorage.getItem('oauthToken');
        const userName = localStorage.getItem('userName');
        console.log("user login success ");
        
        if (!accessToken && !userName) {
             window.location.href = 'login.html';
        }
    }

    function displayUserName() {
        const userName = localStorage.getItem('userName');
        const profileNameElement = document.getElementById('profile-name');
        profileNameElement.textContent = userName;
    }

    function displayExpenses() {
        const userName = localStorage.getItem('userName');
        fetch(`${API_BASE_URL}/expense/${userName}`)
        .then(response => response.json())
        .then(expenses => {
            expensesList.innerHTML = '';
            let totalExpense = 0;
            expenses.forEach(expense => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    ${expense.name} - $${expense.amount.toFixed(2)} - ${expense.date} - ${expense.catagory}
                    <button onclick="deleteExpense(${expense.id})">Delete</button>
                `;
                expensesList.appendChild(listItem);
                totalExpense += expense.amount;
            });
            totalExpenseElement.textContent = `Total Expense: $${totalExpense.toFixed(2)}`;
        })
        .catch(error => console.error('Error fetching expenses:', error));
    }

    window.deleteExpense = (id) => {
        fetch(`${API_BASE_URL}/expense/${id}`, {
            method: 'DELETE',
        })
        .then(() => {
            displayExpenses();
            updateChart();
        })
        .catch(error => console.error('Error deleting expense:', error));
    };

    function setBudget() {
        const budgetAmount = parseFloat(document.getElementById('budget-amount').value);
        const userName = localStorage.getItem('userName');
        fetch(`${API_BASE_URL}/budget/${userName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: budgetAmount }),
        })
        .then(response => response.json())
        .then(budget => {
            alert(`Budget set to $${budget.amount.toFixed(2)}`);
            budgetForm.reset();
        })
        .catch(error => console.error('Error setting budget:', error));
    }

    function updateChart() {
        const userName = localStorage.getItem('userName');
        fetch(`${API_BASE_URL}/expense/report/${userName}`)
        .then(response => response.json())
        .then(report => {
            const categories = Object.keys(report);
            const categoryTotals = Object.values(report);

            if (window.expenseChart) {
                window.expenseChart.destroy();
            }

            window.expenseChart = new Chart(expenseChartCtx, {
                type: 'pie',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Expenses by Category',
                        data: categoryTotals,
                        backgroundColor: [
                            'red', 'blue', 'green', 'orange', 'purple'
                        ]
                    }]
                }
            });
        })
        .catch(error => console.error('Error updating chart:', error));
    }

    displayExpenses();
    updateChart();
});

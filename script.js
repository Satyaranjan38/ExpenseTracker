

document.addEventListener('DOMContentLoaded', () => {
    checkAuthorization() ; 
    displayUserName();
     

    
    const expenseForm = document.getElementById('expense-form');
    const budgetForm = document.getElementById('budget-form');
    const expensesList = document.getElementById('expenses');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
    const totalExpenseElement = document.getElementById('total-expense');
    const API_BASE_URL = 'https://MovieSearch.cfapps.us10-001.hana.ondemand.com'; 
    const budgetReportChartCanvas = document.getElementById('Budget-report-chart') ; 

    const expenseChartCanvas = document.getElementById('expense-chart');
    const currentMonthChartCanvas = document.getElementById('expense-chart');;

    let currentChart = null;

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
        console.log("checking authorization");
        const accessToken = localStorage.getItem('oauthToken');
        const userName = localStorage.getItem('userName');
        console.log("user name " + userName);
        console.log("user login success ");
        
        if (!accessToken || !userName) {
            
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
        fetch(`${API_BASE_URL}/expense/current-month/${userName}`)
            .then(response => response.json())
            .then(expenses => {
                const expensesTableBody = document.getElementById('expensesTableBody');
                const totalExpenseElement = document.getElementById('total-expense');
                
                expensesTableBody.innerHTML = '';
                let totalExpense = 0;
                
                expenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.name}</td>
                        <td>${expense.amount.toFixed(2)}</td>
                        <td>${expense.date}</td>
                        <td>${expense.catagory}</td>
                        <td><button onclick="deleteExpense(${expense.id})">Delete</button></td>
                    `;
                    expensesTableBody.appendChild(row);
                    totalExpense += expense.amount;
                });
                
                totalExpenseElement.textContent = `Total Expense: ${totalExpense.toFixed(2)}`;
            })
            .catch(error => console.error('Error fetching expenses:', error));
    }

    window.deleteExpense = (id) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            fetch(`${API_BASE_URL}/expense/${id}`, {
                method: 'DELETE',
            })
            .then(() => {
                // filterExpenses();
                displayExpenses();
                updateChart();
            })
            .catch(error => console.error('Error deleting expense:', error));
        }
    };

    function setBudget() {
        const budgetAmount = parseFloat(document.getElementById('budget-amount').value);
        const userName = localStorage.getItem('userName');
        fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/budget/${userName}`, {
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


    function createChart(canvas, chartType, data, labels, label) {
        if (currentChart) {
            currentChart.destroy();
        }

        currentChart = new Chart(canvas.getContext('2d'), {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: chartType === 'pie' ? 
                        ['red', 'blue', 'green', 'orange', 'purple'] :
                        'rgba(75, 192, 192, 0.2)',
                    borderColor: chartType === 'pie' ? 
                        [] : 'rgba(75, 192, 192, 1)',
                    borderWidth: chartType === 'pie' ? 0 : 1
                }]
            },
            options: {
                responsive: true,
                scales: chartType === 'bar' ? {
                    x: {
                        type: 'category',
                        labels: labels,
                    },
                    y: {
                        beginAtZero: true
                    }
                } : {}
            }
        });
    }


    function updateBudgetReport() {
        const userName = localStorage.getItem('userName');
        
        fetch(`${API_BASE_URL}/thisMonthBudgetReports/${userName}`)
            .then(response => response.json())
            .then(report => {
                const budget = report.budget;
                const totalExpense = report.expense;

                console.log("budget is " + report.budget) ; 
                console.log("total expense is " + report.expense) ; 

                if (totalExpense <= budget) {
                   
                    createChart(
                        budgetReportChartCanvas,
                        'pie',
                        [totalExpense, budget - totalExpense],
                        ['Spent', 'Remaining'],
                        'Budget Report',
                        
                    );
                } 
                else {
                    createChart(
                        budgetReportChartCanvas,
                        'bar',
                        [budget, totalExpense - budget],
                        ['Budget', 'Exceeded'],
                        'Budget Report'
                    );
                }
            })
            .catch(error => console.error('Error fetching budget report:', error));
    }

    
    
    function showPieChart(expenses) {
        
        createChart(expenseChartCanvas, 'pie', expenses.values, expenses.categories, 'Current Month Expenses');
        expenseChartCanvas.style.display = 'block';
        currentMonthChartCanvas.style.display = 'none';
    }

    function showBarChart(monthlyExpenses) {

        if (window.expenseChart) {
            window.expenseChart.destroy();
        }
        createChart(currentMonthChartCanvas, 'bar', Object.values(monthlyExpenses), Object.keys(monthlyExpenses), 'Monthly Expenses');
        expenseChartCanvas.style.display = 'none';
        currentMonthChartCanvas.style.display = 'block';
    }


    function fetchData() {
        const userName = localStorage.getItem('userName');
        return {
            currentMonthExpenses: fetch(`${API_BASE_URL}/expense/current-month/${userName}`)
                .then(response => response.json())
                .catch(error => console.error('Error fetching current month expenses:', error)),
            monthWiseExpenses: fetch(`${API_BASE_URL}/expense/monthwise/${userName}`)
                .then(response => response.json())
                .catch(error => console.error('Error fetching monthly expenses:', error))
        };
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
                            'gray', 'blue', 'green', 'orange', 'purple'
                        ]
                    }]
                }
            });
        })
        .catch(error => console.error('Error updating chart:', error));
    }

    // document.getElementById('view-current-month').addEventListener('click', () => {
        

    //     fetchData().currentMonthExpenses.then(expenses => {
    //         showPieChart({
    //             categories: expenses.map(e => e.category),
    //             values: expenses.map(e => e.amount)
    //         });
    //     });
    // });

    function downloadPdf() {
       
    
        fetch(`${API_BASE_URL}/pdf/download/${localStorage.getItem('userName')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'expense_report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading PDF:', error));
    }


    document.getElementById('view-monthly').addEventListener('click', () => {
        fetchData().monthWiseExpenses.then(monthlyExpenses => {
            showBarChart(monthlyExpenses);
        });
    });

    document.getElementById('download-pdf').addEventListener('click', () => {
        downloadPdf();
    });

    document.getElementById('lent').addEventListener('click', () => {
        window.location.href='lent.html';
    });

    const filterCategory = document.getElementById('filter-category');

    filterCategory.addEventListener('change', () => {
        filterExpenses();
    });

    function filterExpenses() {
        const selectedCategory = filterCategory.value;
        const userName = localStorage.getItem('userName');
        fetch(`${API_BASE_URL}/expense/current-month/${userName}`)
            .then(response => response.json())
            .then(expenses => {
                const expensesTableBody = document.getElementById('expensesTableBody');
                expensesTableBody.innerHTML = '';
                let totalExpense = 0;

                expenses
                    .filter(expense => !selectedCategory || expense.catagory === selectedCategory)
                    .forEach(expense => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${expense.name}</td>
                            <td>${expense.amount.toFixed(2)}</td>
                            <td>${expense.date}</td>
                            <td>${expense.catagory}</td>
                            <td><button onclick="deleteExpense(${expense.id})">Delete</button></td>
                        `;
                        expensesTableBody.appendChild(row);
                        totalExpense += expense.amount;
                    });

                totalExpenseElement.textContent = `Total Expense: ${totalExpense.toFixed(2)}`;
            })
            .catch(error => console.error('Error fetching expenses:', error));
    }





    displayExpenses();
    updateChart();
    updateBudgetReport();
});









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
        console.log("profileNameElement" + profileNameElement);
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
    const ctx = document.getElementById('PhonePay-report-chart').getContext('2d');
    const userName = localStorage.getItem('userName');
    fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/api/getPhonePayMonthlyReports/${userName}`)
    .then(response => response.json())
    .then(data => {
        // Define an array to maintain the correct month order
        const monthOrder = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        
        // Process the response to extract and sort months, amounts, and transaction types
        const transactions = data.filter(transaction => transaction.year === new Date().getFullYear().toString());

        // Sort transactions by month order
        transactions.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

        const months = transactions.map(transaction => transaction.month);
        const amounts = transactions.map(transaction => transaction.amount);

        populatePhonePayTable(data);
        populateYearFilter(data) ; 

        // Create a chart using Chart.js
        const myChart = new Chart(ctx, {
            type: 'bar', // Change 'bar' to other chart types like 'line' if needed
            data: {
                labels: months,
                datasets: [{
                    label: 'Amount (INR)',
                    data: amounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (INR)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Expenses for Current Year'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.dataset.label}: INR ${tooltipItem.raw}`;
                            }
                        }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching the monthly reports:', error);
        alert('An error occurred while fetching the monthly reports.');
    });
    
    function populatePhonePayTable(data) {
        const phonePayTableBody = document.getElementById('phonePayTableBody');
        phonePayTableBody.innerHTML = ''; // Clear existing rows
    
        const monthOrder = {
            "JANUARY": 1,
            "FEBRUARY": 2,
            "MARCH": 3,
            "APRIL": 4,
            "MAY": 5,
            "JUNE": 6,
            "JULY": 7,
            "AUGUST": 8,
            "SEPTEMBER": 9,
            "OCTOBER": 10,
            "NOVEMBER": 11,
            "DECEMBER": 12
        };
    
        // Sort data by year in descending order and then by month in ascending order
        data.sort((a, b) => {
            if (b.year === a.year) {
                return monthOrder[a.month] - monthOrder[b.month];
            }
            return b.year - a.year;
        });
    
        let totalAmount = 0;
    
        data.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.month}</td>
                <td>${transaction.year}</td>
                <td>${transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td>${transaction.transactionType}</td>
            `;
            phonePayTableBody.appendChild(row);
    
            // Add the transaction amount to the total
            totalAmount += transaction.amount;
        });
    
        // Add a footer row to show the total amount for the year
        const footerRow = document.createElement('tr');
        footerRow.innerHTML = `
            <td colspan="2"><strong>Total</strong></td>
            <td colspan="2"><strong>${totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</strong></td>
        `;
        footerRow.style.fontWeight = 'bold'; // Make the footer row bold
        phonePayTableBody.appendChild(footerRow);
    }
    
    function populateYearFilter(data) {
        const yearFilter = document.getElementById('yearFilter');
        const years = [...new Set(data.map(transaction => transaction.year))]; // Get unique years
    
        // Clear existing options
        yearFilter.innerHTML = '<option value="">All Years</option>';
    
        // Populate dropdown with years
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    
        // Add event listener to filter data based on selected year
        yearFilter.addEventListener('change', () => {
            const selectedYear = yearFilter.value;
            const filteredData = selectedYear ? data.filter(transaction => transaction.year == selectedYear) : data;
            populatePhonePayTable(filteredData);
        });
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

    document.getElementById('upload').addEventListener('click', () => {
        window.location.href='upload.html';
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

    const notificationBtn = document.getElementById('notification-btn');
const modal = document.getElementById('notification-modal');
const closeModal = document.querySelector('.close');
const notificationList = document.getElementById('notification-list');
const notificationCount = document.getElementById('notification-count');

notificationBtn.addEventListener('click', () => {
    fetchNotifications();
    modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

const fetchNotifications = () => {
    const userName = localStorage.getItem('userName');
    fetch(`${API_BASE_URL}/getNotification?userName=${userName}`)
        .then(response => response.json())
        .then(notifications => {
            notificationList.innerHTML = '';
            let unreadCount = 0;
            notifications.forEach(notification => {
                const listItem = document.createElement('li');
                listItem.textContent = notification.content;
                if (!notification.isRead) {
                    listItem.classList.add('unread');
                    unreadCount++;
                }
                listItem.addEventListener('click', () => {
                    markAsRead(notification);
                });
                notificationList.appendChild(listItem);
            });
            updateNotificationCount(unreadCount);
        })
        .catch(error => console.error('Error fetching notifications:', error));
};

const markAsRead = (notification) => {
    fetch(`${API_BASE_URL}/updateNotification?id=${notification.id}&isRead=true`)
        .then(response => response.json())
        .then(updatedNotification => {
            if (updatedNotification.isRead) {
                const listItem = [...notificationList.children].find(
                    item => item.textContent === notification.content
                );
                listItem.classList.remove('unread');
                listItem.removeEventListener('click', () => {
                    markAsRead(notification);
                });
            }
            // Decrease the unread count
            const currentCount = parseInt(notificationCount.textContent) || 0;
            updateNotificationCount(currentCount - 1);
        })
        .catch(error => console.error('Error updating notification:', error));
};

const updateNotificationCount = (count) => {
    if (count > 0) {
        notificationCount.textContent = count;
        notificationCount.style.display = 'inline';
    } else {
        notificationCount.style.display = 'none';
    }
};






    displayExpenses();
    updateChart();
    updateBudgetReport();
    fetchNotifications();
});







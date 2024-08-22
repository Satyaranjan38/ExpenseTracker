
let data = [];
let totalDebit = 0;
let totalCredit = 0;

document.addEventListener('DOMContentLoaded', () => {

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
        // const accessToken = localStorage.getItem('oauthToken');
        const userName = localStorage.getItem('userName');
        console.log("user name " + userName);
        console.log("user login success ");
        
        if (!userName) {
            
             window.location.href = 'login.html';
        }
    }

    function displayUserName() {
        const userName = localStorage.getItem('userName');
        const profileNameElement = document.getElementById('profile-name');
        console.log("profileNameElement" + profileNameElement);
        profileNameElement.textContent = userName;
    }

    // Function to create a dropdown element for category selection
function createCategoryDropdown(selectedCategory) {
    const categories = [
        { value: 'food', text: 'Food' },
        { value: 'transportation', text: 'Transportation' },
        { value: 'entertainment', text: 'Entertainment' },
        { value: 'utilities', text: 'Utilities' },
        { value: 'others', text: 'Others' }
    ];

    const select = document.createElement('select');
    select.className = 'category-dropdown';
    select.style.display = 'inline-block'; // Adjust styling as needed

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.text;
        if (cat.value === selectedCategory) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}

// Function to handle the update
function showUpdateDropdown(event) {
    const row = event.target.closest('tr');
    console.log("row is " + row) ; 
    const id = row.dataset.id; // Get the expense ID from the row
    console.log("id is " + id) ; 

    // Check if dropdown already exists to avoid duplicates
    if (row.querySelector('.category-dropdown')) {
        return; // Dropdown already present, do nothing
    }

    // Create the dropdown and add it to the row
    const currentCategory = row.querySelector('td:nth-child(4)').textContent.trim();
    const dropdown = createCategoryDropdown(currentCategory);
    console.log("select dropdown " + dropdown.value);
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.onclick = () => updateExpense(id, dropdown.value);

    const actionsCell = row.querySelector('td:nth-child(5)');
    actionsCell.innerHTML = ''; // Clear existing content
    actionsCell.appendChild(dropdown);
    actionsCell.appendChild(updateButton);
}

fetch(`https://railwaybackend-ludo.onrender.com/welcome`); 

// Function to handle the category update
function updateExpense(id, newCategory) {
    fetch(`https://imageocr-nsnb.onrender.com/update-category/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            category: newCategory
        })
    })
    .then(response => response.json())
    .then(data => {
        // Refresh the expense list and update the chart
        displayExpenses();
        updateChart();
        alert("Expense updated successfully!");
    })
    .catch(error => console.error('Error updating expense:', error));
}

// Attach event listener to the actions column buttons
function attachUpdateListeners() {
    const actionButtons = document.querySelectorAll('#expensesTable .update-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', showUpdateDropdown);
    });
}


document.getElementById('filter-category').addEventListener('change', filterExpenses);
document.getElementById('filter-transaction-type').addEventListener('change', filterExpenses);

function filterExpenses() {
    const categoryFilter = document.getElementById('filter-category').value.toLowerCase();
    const transactionTypeFilter = document.getElementById('filter-transaction-type').value;

    const rows = document.querySelectorAll('#expensesTableBody tr');
    let totalDebit = 0;
    let totalCredit = 0;

    rows.forEach(row => {
        const category = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        const transactionType = row.querySelector('td:nth-child(5)').textContent;

        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesTransactionType = !transactionTypeFilter || transactionType === transactionTypeFilter;

        if (matchesCategory && matchesTransactionType) {
            row.style.display = '';
            const amount = parseFloat(row.querySelector('td:nth-child(2)').textContent.replace(/[^0-9.-]+/g, ""));
            if (transactionType === 'Debit') {
                totalDebit += amount;
            } else if (transactionType === 'Credit') {
                totalCredit += amount;
            }
        } else {
            row.style.display = 'none';
        }
    });

    document.getElementById('totalDebit').textContent = `Total Debit: INR ${totalDebit.toFixed(2)}`;
    document.getElementById('totalCredit').textContent = `Total Credit: INR ${totalCredit.toFixed(2)}`;
}

// Update displayExpenses function to include the new "Update" button
function displayExpenses() {
    const userName = localStorage.getItem('userName');
    const totalHeaderExpense = document.getElementById('total-expense') ; 
    showLoader();
    fetch(`https://imageocr-nsnb.onrender.com/get-current-month-transactions/${userName}`)
        .then(response => response.json())
        .then(expenses => {
            const expensesTableBody = document.getElementById('expensesTableBody');
            expensesTableBody.innerHTML = '';
            let totalDebit = 0;
            let totalCredit = 0;

            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.dataset.id = expense._id; // Set the expense ID in the row data attribute
                row.innerHTML = `
                    <td>${expense.party}</td>
                    <td>${expense.amount.toFixed(2)}</td>
                    <td>${expense.date}</td>
                    <td>${expense.category}</td>
                    <td>${expense.transactionType}</td>
                    <td>
                        <button class="update-btn">Update Category</button>
                    </td>
                `;

                if (expense.transactionType === 'Debit') {
                    totalDebit += expense.amount;
                } else if (expense.transactionType === 'Credit') {
                    totalCredit += expense.amount;
                }

                expensesTableBody.appendChild(row);
            });

            document.getElementById('totalDebit').textContent = `Total Debit: INR ${totalDebit.toFixed(2)}`;
            document.getElementById('totalCredit').textContent = `Total Credit: INR ${totalCredit.toFixed(2)}`;
            document.getElementById('total-expense').textContent = `Total Debit: INR ${totalDebit.toFixed(2)}`;
            hideLoader();
            attachUpdateListeners(); // Re-attach listeners to newly created buttons
        })
        .catch(error => {
            console.error('Error fetching expenses:', error);
            hideLoader();
        });
}




    // window.updateExpense = (id) => {
    //     if (confirm("Are you sure you want to delete this expense?")) {
    //         fetch(`${API_BASE_URL}/expense/${id}`, {
    //             method: 'DELETE',
    //         })
    //         .then(() => {
    //             // filterExpenses();
    //             displayExpenses();
    //             updateChart();
    //         })
    //         .catch(error => console.error('Error deleting expense:', error));
    //     }
    // };

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
    fetch(`https://imageocr-nsnb.onrender.com/get-data/${userName}`)
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
    
    function populatePhonePayTable(transactionData) {
        data = transactionData;
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
    
        let totalDebit = 0;
        let totalCredit = 0;
    
        data.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.month}</td>
                <td>${transaction.year}</td>
                <td>${transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td>${transaction.transactionType}</td>
            `;
            phonePayTableBody.appendChild(row);
    
            // Add the transaction amount to the respective total
            if (transaction.transactionType === 'Debit') {
                totalDebit += transaction.amount;
            } else if (transaction.transactionType === 'Credit') {
                totalCredit += transaction.amount;
            }
        });
    
        // Add footer rows to show the total debit and credit amounts
        const debitFooterRow = document.createElement('tr');
        debitFooterRow.innerHTML = `
            <td colspan="2"><strong>Total Debit</strong></td>
            <td colspan="2"><strong>${totalDebit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</strong></td>
        `;
        debitFooterRow.style.fontWeight = 'bold';
        phonePayTableBody.appendChild(debitFooterRow);
    
        const creditFooterRow = document.createElement('tr');
        creditFooterRow.innerHTML = `
            <td colspan="2"><strong>Total Credit</strong></td>
            <td colspan="2"><strong>${totalCredit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</strong></td>
        `;
        creditFooterRow.style.fontWeight = 'bold';
        phonePayTableBody.appendChild(creditFooterRow);
    }


    // Function to download table data as PDF
// function downloadPDF() {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF();

//     let yPosition = 10; // Starting y position for text

//     const headers = [["Month", "Year", "Amount", "Transaction Type"]];

//     const rows = [];
//     data.forEach(transaction => {
//         rows.push([transaction.month, transaction.year, transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), transaction.transactionType]);
//     });

//     // Adding Total Debit and Credit to the rows
//     rows.push(["", "", "Total Debit", totalDebit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })]);
//     rows.push(["", "", "Total Credit", totalCredit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })]);

//     doc.text("PhonePay Transactions", 14, yPosition);
//     doc.autoTable({
//         startY: yPosition + 10,
//         head: headers,
//         body: rows,
//     });

//     doc.save("PhonePay_Transactions.pdf");
// }

// Function to download table data as Excel
function downloadExcel() {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ["Month", "Year", "Amount", "Transaction Type"]
    ];

    data.forEach(transaction => {
        wsData.push([transaction.month, transaction.year, transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), transaction.transactionType]);
    });

    // Adding Total Debit and Credit to the worksheet data
    wsData.push(["", "", "Total Debit", totalDebit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })]);
    wsData.push(["", "", "Total Credit", totalCredit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "PhonePay Transactions");

    XLSX.writeFile(wb, "PhonePay_Transactions.xlsx");
}

// Add event listeners to the buttons
// document.getElementById('downloadPdf').addEventListener('click', downloadPDF);
document.getElementById('downloadExcel').addEventListener('click', downloadExcel);

    
    
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

    // function filterExpenses() {
    //     const selectedCategory = filterCategory.value;
    //     const userName = localStorage.getItem('userName');
    //     fetch(`${API_BASE_URL}/expense/current-month/${userName}`)
    //         .then(response => response.json())
    //         .then(expenses => {
    //             const expensesTableBody = document.getElementById('expensesTableBody');
    //             expensesTableBody.innerHTML = '';
    //             let totalExpense = 0;

    //             expenses
    //                 .filter(expense => !selectedCategory || expense.catagory === selectedCategory)
    //                 .forEach(expense => {
    //                     const row = document.createElement('tr');
    //                     row.innerHTML = `
    //                         <td>${expense.name}</td>
    //                         <td>${expense.amount.toFixed(2)}</td>
    //                         <td>${expense.date}</td>
    //                         <td>${expense.catagory}</td>
    //                         <td><button onclick="deleteExpense(${expense.id})">Delete</button></td>
    //                     `;
    //                     expensesTableBody.appendChild(row);
    //                     totalExpense += expense.amount;
    //                 });

    //             totalExpenseElement.textContent = `Total Expense: ${totalExpense.toFixed(2)}`;
    //         })
    //         .catch(error => console.error('Error fetching expenses:', error));
    // }

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







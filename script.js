
let data = [];
let totalDebit = 0;
let totalCredit = 0;

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('mobile').addEventListener('click', () => {
        window.location.href = 'zmobile.html';
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


    checkAuthorization();
    displayUserName();



    const expenseForm = document.getElementById('expense-form');
    const budgetForm = document.getElementById('budget-form');
    const expensesList = document.getElementById('expenses');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
    const totalExpenseElement = document.getElementById('total-expense');
    const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com';    
    const API_BASE_URL2 = 'https://imageocr-nsnb.onrender.com';
//  const API_BASE_URL = 'https://railwaybackend-ludo.onrender.com';
//  const API_BASE_URL2 = 'https://imageocr-nsnb.onrender.com';
    const budgetReportChartCanvas = document.getElementById('Budget-report-chart');

    const expenseChartCanvas = document.getElementById('expense-chart');
    const currentMonthChartCanvas = document.getElementById('expense-chart');;

    let currentChart = null;

    // expenseForm.addEventListener('submit', (event) => {
    //     event.preventDefault();
    //     addExpense();
    // });

    budgetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        setBudget();
    });

    // function addExpense() {
    //     const name = document.getElementById('expense-name').value;
    //     const amount = parseFloat(document.getElementById('expense-amount').value);
    //     const date = document.getElementById('expense-date').value;
    //     const catagory = document.getElementById('expense-category').value;
    //     const userName = localStorage.getItem('userName');

    //     fetch(`${API_BASE_URL}/expense`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ name, amount, date, catagory, userName }),
    //     })
    //         .then(response => response.json())
    //         .then(expense => {
    //             displayExpenses();
    //             // updateChart();
    //             expenseForm.reset();
    //         })
    //         .catch(error => console.error('Error adding expense:', error));
    // }

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
        console.log("row is " + row);
        const id = row.dataset.id; // Get the expense ID from the row
        console.log("id is " + id);

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
    const lentButton = document.getElementById('lent');
    enableButtonAfterFetch();
    function enableButtonAfterFetch() {
        fetch(`${API_BASE_URL}/welcome`)
            .then(response => {
                if (response.ok) {
                    // Enable the button oncexxxxxxxxxxx the response is received
                    lentButton.disabled = false;
                    lentButton.classList.remove('disabled-button');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                lentButton.disabled = false;
                lentButton.classList.remove('disabled-button');
            });
    }

    // Function to handle the category update
    function updateExpense(id, newCategory) {
        fetch(`${API_BASE_URL2}/update-category/${id}`, {
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
                // updateChart();
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
    let currentPage = 1;
    const itemsPerPage = 5;
    let cachedExpenses = []; // Variable to store fetched expenses

    function fetchExpenses() {
        const userName = localStorage.getItem('userName');
        showLoader();

        fetch(`${API_BASE_URL2}/get-current-month-transactions/${userName}`)
            .then(response => response.json())
            .then(expenses => {
                cachedExpenses = expenses; // Cache the fetched expenses
                displayTotals(); // Calculate and display total debit and credit for all expenses
                displayExpenses(currentPage); // Display expenses for the current page
                hideLoader();
            })
            .catch(error => {
                console.error('Error fetching expenses:', error);
                hideLoader();
            });
    }

    function displayExpenses(page = 1) {
        const expensesTableBody = document.getElementById('expensesTableBody');
        expensesTableBody.innerHTML = '';

        // Calculate pagination details
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const paginatedExpenses = cachedExpenses.slice(startIndex, endIndex);

        paginatedExpenses.forEach(expense => {
            const row = document.createElement('tr');
            row.dataset.id = expense._id;
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

            expensesTableBody.appendChild(row);
        });

        attachUpdateListeners();

        // Update pagination controls
        updatePagination(cachedExpenses.length, page);
    }

    function displayTotals() {
        let totalDebit = 0;
        let totalCredit = 0;

        cachedExpenses.forEach(expense => {
            if (expense.transactionType === 'Debit') {
                totalDebit += expense.amount;
            } else if (expense.transactionType === 'Credit') {
                totalCredit += expense.amount;
            }
        });

        document.getElementById('totalDebit').textContent = `Total Debit: INR ${totalDebit.toFixed(2)}`;
        document.getElementById('totalCredit').textContent = `Total Credit: INR ${totalCredit.toFixed(2)}`;
        document.getElementById('total-expense').textContent = `Total Debit: INR ${totalDebit.toFixed(2)}`;
    }

    function updatePagination(totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pageIndicator = document.getElementById('pageIndicator');
        const prevPageButton = document.getElementById('prevPage');
        const nextPageButton = document.getElementById('nextPage');

        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        prevPageButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayExpenses(currentPage);
            }
        };

        nextPageButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayExpenses(currentPage);
            }
        };
    }

    // Initial fetch
    fetchExpenses();




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
        const budgetReportChartCanvas = document.getElementById('report-budget');

        fetch(`${API_BASE_URL}/getBudgetReport/${userName}`)
            .then(response => response.json())
            .then(report => {
                const budget = report.body.budget;
                const totalExpense = report.body.totalExpense;

                console.log("budget is " + report.body.budget);
                console.log("total expense is " + report.body.expense);

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
                        [budget, totalExpense],
                        ['Budget', 'Expense'],
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
    
    const ctx = document.getElementById('expense-chart').getContext('2d');
    const userName = localStorage.getItem('userName');
    fetch(`${API_BASE_URL2}/get-data/${userName}`)
        .then(response => response.json())
        .then(data => {
            // Define an array to maintain the correct month order
            const monthOrder = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    
            // Process the response to extract and sort months, amounts, and transaction types
            const transactions = data.filter(transaction => transaction.year === new Date().getFullYear().toString());
    
            // Sort transactions by month order
            transactions.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    
            const debitAmounts = [];
            const creditAmounts = [];
    
            monthOrder.forEach(month => {
                const debitTransaction = transactions.find(transaction => transaction.month === month && transaction.transactionType === 'Debit');
                const creditTransaction = transactions.find(transaction => transaction.month === month && transaction.transactionType === 'Credit');
    
                // If no debit/credit transaction exists for the month, push 0
                debitAmounts.push(debitTransaction ? debitTransaction.amount : 0);
                creditAmounts.push(creditTransaction ? creditTransaction.amount : 0);
            });
    
            const months = transactions.map(transaction => transaction.month);
            const amounts = transactions.map(transaction => transaction.amount);
    
            populatePhonePayTable(data);
            populateYearFilter(data);
    
            // Create a chart using Chart.js with zoom and pan functionality
            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: monthOrder,
                    datasets: [
                        {
                            label: 'Debit (INR)',
                            data: debitAmounts,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red for Debit
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Credit (INR)',
                            data: creditAmounts,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Green for Credit
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }
                    ]
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
                            text: 'Monthly Debit and Credit for Current Year'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    return `${tooltipItem.dataset.label}: INR ${tooltipItem.raw}`;
                                }
                            }
                        },
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'xy', // Enable panning in both directions
                            },
                            zoom: {
                                wheel: {
                                    enabled: true, // Enable zooming with the mouse wheel
                                },
                                pinch: {
                                    enabled: true, // Enable zooming with touch gestures
                                },
                                mode: 'xy', // Enable zooming in both directions
                            }
                        }
                    }
                }
            });
    
            // Add event listener for the reset zoom button
            document.getElementById('resetZoom').addEventListener('click', function() {
                myChart.resetZoom();
            });
    
            // Add event listeners for zoom in and zoom out buttons
            document.getElementById('zoomIn').addEventListener('click', function() {
                myChart.zoom(1.1); // Zoom in by 10%
            });
    
            document.getElementById('zoomOut').addEventListener('click', function() {
                myChart.zoom(0.9); // Zoom out by 10%
            });
    
        })
        .catch(error => {
            console.error('Error fetching the monthly reports:', error);
            alert('An error occurred while fetching the monthly reports.');
        });
    

    let currentPhonePayPage = 1;
    const phonePayItemsPerPage = 6;
    let phonePayData = []; // Variable to store the transaction data

    function populatePhonePayTable(transactionData) {
        phonePayData = transactionData; // Store the data
        displayPhonePayTable(currentPhonePayPage); // Display the first page
        updatePhonePayPagination(phonePayData.length, currentPhonePayPage); // Update pagination controls
    }

    function displayPhonePayTable(page = 1) {
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
        phonePayData.sort((a, b) => {
            if (b.year === a.year) {
                return monthOrder[a.month] - monthOrder[b.month];
            }
            return b.year - a.year;
        });

        // Calculate pagination details
        const startIndex = (page - 1) * phonePayItemsPerPage;
        const endIndex = page * phonePayItemsPerPage;
        const paginatedTransactions = phonePayData.slice(startIndex, endIndex);

        let totalDebit = 0;
        let totalCredit = 0;

        paginatedTransactions.forEach(transaction => {
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

        // Add footer rows to show the total debit and credit amounts for the current page
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

    function updatePhonePayPagination(totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / phonePayItemsPerPage);
        const pageIndicator = document.getElementById('phonePayPageIndicator');
        const prevPageButton = document.getElementById('phonePayPrevPage');
        const nextPageButton = document.getElementById('phonePayNextPage');

        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        prevPageButton.onclick = () => {
            if (currentPage > 1) {
                currentPhonePayPage--;
                displayPhonePayTable(currentPhonePayPage);
                updatePhonePayPagination(totalItems, currentPhonePayPage);
            }
        };

        nextPageButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPhonePayPage++;
                displayPhonePayTable(currentPhonePayPage);
                updatePhonePayPagination(totalItems, currentPhonePayPage);
            }
        };
    }


    function downloadExcel() {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ["Month", "Year", "Amount", "Transaction Type"]
        ];
    
        // Add transactions to the worksheet
        phonePayData.forEach(transaction => {
            wsData.push([
                transaction.month,
                transaction.year,
                transaction.amount,
                transaction.transactionType
            ]);
        });
    
        // Calculate Total Debit and Credit
        const totalDebit = phonePayData.filter(t => t.transactionType === 'Debit')
                                       .reduce((sum, t) => sum + t.amount, 0);
        const totalCredit = phonePayData.filter(t => t.transactionType === 'Credit')
                                        .reduce((sum, t) => sum + t.amount, 0);
    
        // Add Total Debit and Credit to the worksheet
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




    // function updateChart() {
    //     const userName = localStorage.getItem('userName');
    //     fetch(`${API_BASE_URL}/expense/report/${userName}`)
    //         .then(response => response.json())
    //         .then(report => {
    //             const categories = Object.keys(report);
    //             const categoryTotals = Object.values(report);

    //             if (window.expenseChart) {
    //                 window.expenseChart.destroy();
    //             }

    //             window.expenseChart = new Chart(expenseChartCtx, {
    //                 type: 'pie',
    //                 data: {
    //                     labels: categories,
    //                     datasets: [{
    //                         label: 'Expenses by Category',
    //                         data: categoryTotals,
    //                         backgroundColor: [
    //                             'gray', 'blue', 'green', 'orange', 'purple'
    //                         ]
    //                     }]
    //                 }
    //             });
    //         })
    //         .catch(error => console.error('Error updating chart:', error));
    // }

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


    // document.getElementById('view-monthly').addEventListener('click', () => {
    //     fetchData().monthWiseExpenses.then(monthlyExpenses => {
    //         showBarChart(monthlyExpenses);
    //     });
    // });

    document.getElementById('download-pdf').addEventListener('click', () => {
        downloadPdf();
    });

    document.getElementById('lent').addEventListener('click', () => {
        window.location.href = 'lent.html';
    });

    document.getElementById('upload').addEventListener('click', () => {
        window.location.href = 'upload.html';
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
    // updateChart();
    updateBudgetReport();
    setInterval(fetchNotifications, 60000);
    fetchNotifications();
});

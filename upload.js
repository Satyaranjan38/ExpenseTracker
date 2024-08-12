document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent form submission

    const fileInput = document.getElementById('fileInput');
    const passwordInput = document.getElementById('passwordInput');
    const resultTable = document.getElementById('resultTable');
    const tableBody = resultTable.querySelector('tbody');
    const totalAmountCell = document.getElementById('totalAmount');

    const file = fileInput.files[0];
    const password = passwordInput.value;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    fetch('https://imageocr-nsnb.onrender.com/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = '';  // Clear previous results
        let totalAmount = 0;

        if (data.error) {
            alert(data.error);
            return;
        }

        data.transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = transaction.date;
            row.appendChild(dateCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = transaction.transaction_type;
            row.appendChild(typeCell);

            const paidToCell = document.createElement('td');
            paidToCell.textContent = transaction.paid_to;
            row.appendChild(paidToCell);

            const amountCell = document.createElement('td');
            amountCell.textContent = transaction.amount;
            row.appendChild(amountCell);

            totalAmount += parseFloat(transaction.amount.replace(/[^0-9.-]+/g, ""));

            tableBody.appendChild(row);
        });

        totalAmountCell.textContent = `INR ${totalAmount.toFixed(2)}`;
        resultTable.style.display = 'table';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while uploading the file.');
    });
});
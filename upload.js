document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent form submission

    const fileInput = document.getElementById('fileInput');
    const passwordInput = document.getElementById('passwordInput');
    const deviceSelect = document.getElementById('deviceSelect');
    const resultTable = document.getElementById('resultTable');
    const tableBody = resultTable.querySelector('tbody');
    const totalAmountCell = document.getElementById('totalAmount');
    const totalDebit = document.getElementById('total-debit');
    // const API_BASE_URL = 'https://imageocr-9llr.onrender.com';
    const API_BASE_URL = 'https://imageocr-nsnb.onrender.com';

    const file = fileInput.files[0];
    const password = passwordInput.value;
    const device = deviceSelect.value;

    if (!device) {
        alert('Please select a device.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('userName', localStorage.getItem('userName'));
    formData.append('device', device);

    showLoader();
    fetch(`${API_BASE_URL}/upload`, {
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
                paidToCell.textContent = transaction.party;
                row.appendChild(paidToCell);

                const amountCell = document.createElement('td');
                amountCell.textContent = transaction.amount;
                row.appendChild(amountCell);

                totalAmount += parseFloat(transaction.amount.replace(/[^0-9.-]+/g, ""));

                tableBody.appendChild(row);
            });

            totalAmountCell.textContent = `INR ${totalAmount.toFixed(2)}`;
            totalDebit.textContent = `Total Debit INR ${totalAmount.toFixed(2)}`;
            resultTable.style.display = 'table';

            hideLoader();

            saveDataInBackend(file, password, device); // Pass device to saveDataInBackend
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
        });
});

function saveDataInBackend(file, password, device) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('device', device);
    const userName = localStorage.getItem('userName');

    fetch(`${API_BASE_URL}/api/upload/${userName}`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Data saved successfully:', data);
        })
        .catch(error => {
            console.error('Error saving data to backend:', error);
            alert('An error occurred while saving data to the backend.');
        });
}

function showLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('active');
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.remove('active');
    loader.style.display = 'none';
}

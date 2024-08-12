
document.addEventListener('DOMContentLoaded', () =>  {
document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    displayUserName();
    // const API_BASE_URL = "http://localhost:8086";
    const API_BASE_URL = "https://MovieSearch.cfapps.us10-001.hana.ondemand.com";

    // function displayUserName() {
    //     const userNameElement = document.getElementById('userName');
    //     if (userNameElement) {
    //         userNameElement.textContent = 'Hello, User!';
    //     } else {
    //         console.error('Element with ID userName not found');
    //     }
    // }

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const password = document.getElementById('passwordInput').value;

    function displayUserName() {
        const userName = localStorage.getItem('userName');
        const profileNameElement = document.getElementById('profile-name');
        profileNameElement.textContent = userName;
    }

    if (!file) {
        alert('Please select a PDF file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    fetch(`${API_BASE_URL}/api/upload-pdf`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.base64Excel) {
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data.base64Excel;
            downloadLink.download = 'converted.xlsx';
            downloadLink.style.display = 'block';
        } else {
            alert('Failed to convert PDF to Excel. ' + (data.error || ''));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while uploading the PDF.');
    });
});

});

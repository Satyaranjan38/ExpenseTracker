document.getElementById('createGroupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const groupName = document.getElementById('groupName').value;
    fetch('http://localhost:8086/api/groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupName),
    })
    .then(response => response.json())
    .then(group => {
        alert(`Group created! Join Code: ${group.joinCode}`);
    });
});

document.getElementById('joinGroupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const joinCode = document.getElementById('joinCode').value;
    const userName = document.getElementById('userName').value;
    fetch(`http://localhost:8086/api/groups/join?joinCode=${joinCode}&userName=${userName}`, {
        method: 'POST'
    })
    .then(() => {
        alert('Joined group successfully!');
    });
});

function loadGroupExpenses(groupId) {
    fetch(`http://localhost:8086/api/groups/${groupId}/expenses`)
    .then(response => response.json())
    .then(expenses => {
        const expensesDiv = document.getElementById('groupExpenses');
        expensesDiv.innerHTML = '';
        expenses.forEach(expense => {
            const div = document.createElement('div');
            div.textContent = `${expense.name}: $${expense.amount} on ${expense.date}`;
            expensesDiv.appendChild(div);
        });
    });
}

// Constants for API endpoints
const API_BASE_URL = 'http://127.0.0.1:3000/api';

// DOM elements
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const balanceDisplay = document.getElementById('balance');
const incomeDisplay = document.getElementById('income');
const expenseDisplay = document.getElementById('expense');
const statusDisplay = document.getElementById('status');

// Function to fetch expenses and update the UI
async function fetchExpenses() {
  statusDisplay.textContent = ''; // Clear previous status message

  try {
    console.log('Fetching expenses...');
    const response = await fetch(`${API_BASE_URL}/expense`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('Response Status:', response.status);

    // Handle different response statuses
    if (response.status === 401) {
      throw new Error('Unauthorized access. Please log in.');
    } else if (response.status === 500) {
      throw new Error('Internal server error.');
    } else if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response Text:', errorText);
      throw new Error('Failed to fetch expenses');
    }

    const expenses = await response.json();
    console.log('Fetched expenses:', expenses);

    // Check if expenses is in the expected format
    if (!Array.isArray(expenses)) {
      console.error('Unexpected response format:', expenses);
      throw new Error('Unexpected response format');
    }

    updateTransactionList(expenses);
    statusDisplay.textContent = 'Expenses fetched successfully!'; // Optional success message
  } catch (error) {
    console.error('Fetch Error:', error);
    statusDisplay.textContent = `Error fetching expenses: ${error.message}`;
  }
}

// Function to update the transaction list
function updateTransactionList(expenses) {
  transactionList.innerHTML = '';
  let totalIncome = 0;
  let totalExpense = 0;

  expenses.forEach(expense => {
    const listItem = document.createElement('li');
    listItem.textContent = `${expense.category}: $${expense.amount} on ${new Date(expense.date).toLocaleDateString()}`;

    // Edit button
    const editButton = document.createElement('button');
    editButton.classList.add('buttons');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editExpense(expense));

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('buttons');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteExpense(expense.id));

    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    transactionList.appendChild(listItem);

    // Ensure amount is treated as a number
    const amount = parseFloat(expense.amount);
    if (isNaN(amount)) {
      console.warn('Invalid amount value:', expense.amount);
      return; // Skip this item if amount is invalid
    }

    // Calculate totals
    if (amount > 0) {
      totalExpense += amount;
    } else {
      totalIncome += amount;
    }
  });

  // Ensure totalIncome, totalExpense, and totalBalance are numbers
  const totalBalance = totalIncome ;
  if (isNaN(totalIncome) || isNaN(totalExpense) || isNaN(totalBalance)) {
    console.error('Total values are not numbers:', { totalIncome, totalExpense, totalBalance });
    statusDisplay.textContent = 'Error calculating totals.';
    return;
  }

  // Update balance displays
  balanceDisplay.textContent = `$${totalBalance.toFixed(2)}`;
  incomeDisplay.textContent = `$${totalIncome.toFixed(2)}`;
  expenseDisplay.textContent = `$${Math.abs(totalExpense).toFixed(2)}`;
}

// Function to handle form submission
transactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(transactionForm);
  const type = formData.get('type') ? 'Expense' : 'Income';
  const name = formData.get('name');
  const amount = parseFloat(formData.get('amount'));
  const date = formData.get('date');

  const expenseData = {
    amount: type === 'Expense' ? -amount : amount,
    date: date,
    category: name
  };

  try {
    const response = await fetch(`${API_BASE_URL}/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(expenseData)
    });

    if (!response.ok) {
      throw new Error('Failed to add expense');
    }

    statusDisplay.textContent = 'Transaction added successfully!';
    transactionForm.reset();
    fetchExpenses(); // Refresh the expense list
  } catch (error) {
    console.error(error);
    statusDisplay.textContent = 'Error adding transaction.';
  }
});

// Function to format date for display
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to edit expense
async function editExpense(expense) {
  const newAmount = prompt('Enter new amount:', expense.amount);
  const newDate = prompt('Enter new date (YYYY-MM-DD):', formatDateForDisplay(expense.date));
  const newCategory = prompt('Enter new category:', expense.category);

  if (newAmount && newDate && newCategory) {
    const updatedExpense = {
      amount: parseFloat(newAmount),
      date: newDate,
      category: newCategory
    };

    try {
      const response = await fetch(`${API_BASE_URL}/expense/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedExpense)
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      statusDisplay.textContent = 'Expense updated successfully!';
      fetchExpenses(); // Refresh the expense list
    } catch (error) {
      console.error(error);
      statusDisplay.textContent = 'Error updating expense.';
    }
  }
}

// Function to delete expense
async function deleteExpense(expenseId) {
  console.log('Initiating delete for expense ID:', expenseId); // Log expenseId

  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/expense/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      statusDisplay.textContent = 'Expense deleted successfully!';
      fetchExpenses(); // Refresh the expense list
    } catch (error) {
      console.error('Fetch Error:', error);
      statusDisplay.textContent = 'Error deleting expense.';
    }
  }
}

// Fetch expenses on page load
document.addEventListener('DOMContentLoaded', fetchExpenses);
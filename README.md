# Project Setup and Dependencies
To set up the project, follow these steps:
### directory structure:
```bash
/Expense_Management
├── backend
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── public
│   ├── background.jpg
│   ├── index.css
│   ├── index.html
│   ├── login.html
│   ├── main.css
│   └── register.html
├── login.js
├── register.js
├── expense.js
├── .env
├── .gitignore
├── LICENSE
└── README.md
```

```
### Navigate to the backend directory
```bash
cd Expense_Management
cd backend
```
### Install dependencies
```bash
npm install express mysql2 nodemon cors bcrypt jsonwebtoken dotenv
```
# Project Functionalities
The project is built using JavaScript and Node.js with Express. The main functionalities include:
### User Login
Users are differentiated by their username and password.
### Security
JWT (JSON Web Token) is used to generate tokens for each user.
### Expense Management
- **View Past Expenses**: Users can view their past expenses in their individual account.
- **Add Expense**: Users can add new expenses.
- **Edit Expense**: Users can edit existing expenses.
- **Delete Expense**: Users can delete expenses.
- **Total Expenses**: Users can view the total expenses done in their individual account.
# Instructions to Run the Application
### Ensure MySQL database is running
### Run the application
```bash
nodemon server.js
```
This will start the application. You can access the login page and manage your expenses accordingly.
# frontend-backend-integration

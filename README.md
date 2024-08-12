# Project Setup and Dependencies

To set up the project, follow these steps:

### Clone the repository

```bash
git clone https://github.com/martinsigei/frontend-backend-integration.git
```

### Navigate to the backend directory

```bash
cd frontend-backend-integration
cd backend
```

### Install dependencies

```bash
npm install express mysql2 nodemon cors bcrypt jsonwebtoken dotenv
```

### create a file named (.env) inside backend folder

add the following base on your MySQL database and credentials

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
ACCESS_TOKEN_SECRET=createrandommartinsecretekeyhereandreplacethisone
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
cd backend
nodemon server.js
```

This will start the application. You can access the login page and manage your expenses accordingly.

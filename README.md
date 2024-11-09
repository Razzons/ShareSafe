# ShareSafe

ShareSafe is a secure web application designed for safe file transmission among users. Built using Node.js and JavaScript, it employs crucial information security techniques, including HMAC, hash functions, and encryption algorithms like AES and ChaCha20, ensuring both the confidentiality and integrity of files throughout their transmission process.

## Features

- **Secure File Transmission**: Encrypts files using AES and ChaCha20 algorithms to protect data from unauthorized access.
- **Data Integrity**: Utilizes HMAC and hash functions to ensure data integrity during transmission.
- **User Authentication**: User credentials are encrypted with bcryptjs for secure login functionality.

## Technologies Used

### Backend Dependencies

- **Node.js** - JavaScript runtime for server-side development.
- **bcryptjs** - Library for hashing and validating passwords.
- **body-parser** - Middleware to handle JSON and URL-encoded data.
- **dotenv** - For managing environment variables.
- **express** - Web framework for building the application's server.
- **express-session** - Session middleware for managing user sessions.
- **hbs** - Template engine for rendering HTML views.
- **multer** - Middleware for handling file uploads.
- **mysql** - MySQL database client for managing user and file data.
- **node-forge** - Security library that provides cryptographic tools for HMAC, hash functions, and encryption.
- **nodemon** - Tool for automatically restarting the server during development.

### Database

- **MySQL** - Database management system used to store user and file metadata.
- **Database Structure**: The MySQL database is named **sharesafe** and includes tables as defined in the `database.sql` file.

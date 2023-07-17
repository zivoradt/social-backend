# Chat App (Backend)
This repository contains the backend source code for a chat application, stil in progress. The backend is developed using various technologies. Below are the most important ones:

• Node.js<br>
• TypeScript<br>
• Express.js<br>
• Socket.io<br>
• Mongoose<br>
• Redis<br>
• Jest<br>
• Bull<br>
• Prerequisites<br>
• Before running the application, ensure that you have the following dependencies installed:

Node.js (v18 or higher)
npm (Node Package Manager)

# Installation
To install the necessary dependencies for the chat app backend, follow these steps:

# Clone the repository:

git clone https://github.com/zivoradt/social-backend.git
cd chat-app-backend

Install dependencies:

Run the following command to install the required dependencies:

• npm install<br>
This command will read the package.json file and download all the necessary packages and libraries into a node_modules directory.

# Usage
To start the chat app backend server, use the following command:

• npm start<br>
This command will execute the start script defined in the package.json file. The backend server will start and listen for incoming connections.

# Development
To perform various development tasks, you can use the following scripts:

Start in Development Mode: This command will start the backend server in development mode, which automatically restarts the server when changes are made to the source code.

• npm run dev<br>

Linting:

Check: This command will check the TypeScript source code for linting errors.

• npm run lint:check<br>
Fix: This command will automatically fix the linting errors in the TypeScript source code.

• npm run lint:fix<br>
Code Formatting:

Check: This command will check the TypeScript and JSON files for formatting issues.

• npm run prettier:check<br>
Fix: This command will automatically fix the formatting issues in the TypeScript and JSON files.

• npm run prettier:fix<br>
Build: This command will compile the TypeScript source code into JavaScript and create a build directory.

• npm run build<br>
Testing: This command will run the test suites using Jest, including code coverage reports.

• npm test<br>

# License
This chat app backend is licensed under the ISC License. Feel free to modify, distribute, and use it according to your needs.

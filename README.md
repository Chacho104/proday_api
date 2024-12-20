# API Documentation for To-Do Application

This is an API for the Nooro To-Do Take Home Technical Assessmemnt application built using **Node.js**, **Express.js**, and **TypeScript**, with **MySQL** as the database and **Prisma ORM** for database operations.

## Getting Started

### Prerequisites

To run this project, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later is recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

### Downloading and Setting Up the Project

1. **Download the Project:**
   - Download the project zip file from the GitHub repository.
   - Extract the zip file to your desired location.

2. **Open in an Editor:**
   - Open the extracted folder in your preferred code editor (e.g., [Visual Studio Code](https://code.visualstudio.com/)).

3. **Install Dependencies:**
   - Run the following command in your terminal to install the necessary dependencies:

     ```bash
     npm install
     ```

### Setting Up the Database

1. **Install MySQL:**
   - Download and install MySQL Community Server and MySQL Workbench.
   - Follow the installation instructions for your operating system.

2. **Create a Database:**
   - Open MySQL Workbench and connect to your local MySQL server (ensure it is up and running before attempting to connect).
   - Create a new database by running the following SQL command:

     ```sql
     CREATE DATABASE todo_app;
     ```
    - Alternatively, you can create a new database on MySQL Workbench by clicking on schemas and adding a new schema.

3. **Configure Environment Variables:**
   - Create a `.env` file in the root folder of the project and add the following environment variables:

     ```env
     DATABASE_URL="mysql://username:password@localhost:3306/todo_app"
     ```

     Replace `username` and `password` with your MySQL credentials.

### Initializing the Database with Prisma

1. **Generate Prisma Client:**
   - Run the following command to generate the Prisma client:

     ```bash
     npx prisma generate
     ```

2. **Run Database Migrations:**
   - Apply the Prisma migrations to set up the database schema:

     ```bash
     npx prisma migrate dev --name init
     ```

3. **Verify Database Setup:**
   - Open MySQL Workbench and check that the `todo_app` database contains the necessary tables as defined in the Prisma schema.

### Running the API Server

To start the API server, run the following command:

```bash
tsc
npm run dev
```

The server will start running on [http://localhost:8080](http://localhost:8080).

### Testing the API

You can test the API endpoints using tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/). Also now, if you spin up the Todo App frontend application, you should be able to interact with the API.

## Learn More

To learn more about the tools and technologies used in this project, check out the following resources:

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Prisma Documentation](https://www.prisma.io/docs)

## Feedback and Contributions

Your feedback and contributions are welcome! Feel free to create issues or pull requests on the GitHub repository to suggest improvements or report bugs.


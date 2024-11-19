<a href="https://nestjs.com/" target="blank">
  <p align="center">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </p>
  <h1 align="center">BLiP ERP Backend Application</h1>
</a>

<br>

## Table of Contents

1. [Installation](#installation)
2. [Seeding the Database](#seeding-the-database)
3. [Running the Application](#running-the-application)
4. [Running Tests](#running-tests)
5. [Docker Setup](#docker-setup)
6. [Generate Documentation with Compodoc](#generate-documentation-with-compodoc)
7. [Run Database Seeder](#run-database-seeder)
8. [Folder Structure](#folder-structure)
9. [Create a New Domain](#create-a-new-domain)
10. [Create a New Library](#create-a-new-library)
11. [Create a New Job](#create-a-new-job)
12. [License](#license)

---

## Installation

Follow these steps to install the necessary dependencies and set up the project on your local machine.

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the required Node.js dependencies:

   ```bash
   npm install
   ```

This will install all the necessary packages listed in `package.json`, including NestJS and any additional dependencies used in the project.

---

## Seeding the Database

If you're running the application in a development environment and need to populate the database with sample data, you can use the following command to seed the database:

```bash
npm run db:seed
```

This will run a script that inserts predefined data into your database, which can be useful for development and testing.

---

## Running the Application

To start the application in different modes, use the following commands:

1. **Development Mode**:

   ```bash
   npm run start
   ```

   This will start the application in **development mode**, which includes live-reloading and debugging capabilities.

2. **Watch Mode**:

   ```bash
   npm run start:dev
   ```

   This will start the application in **watch mode**, which automatically recompiles and restarts the app when file changes are detected (ideal for local development).

3. **Production Mode**:

   ```bash
   npm run start:prod
   ```

   This command runs the application in **production mode** with optimizations and without live-reloading. It is the recommended mode when deploying the app to a production environment.

---

## Running Tests

The application includes unit tests and test coverage tools. You can run tests using the following commands:

1. **Unit Tests**:

   ```bash
   npm run test
   ```

   This will run all unit tests in the project.

2. **Watch Mode for Unit Tests**:

   ```bash
   npm run test:watch
   ```

   This will run the tests in **watch mode**, automatically rerunning tests as you make changes to your code.

3. **Test Coverage**:

   ```bash
   npm run test:cov
   ```

   This will run the tests and generate a code coverage report, showing how much of the application is covered by tests.

4. **Test End to End**:

   ```bash
   npm run test:e2e
   ```

   This will run all end to end test in the project.

5. **Watch Mode for Test End to End**:

   ```bash
   npm run test:e2e:watch
   ```

   This will run the end to end tests in **watch mode**, automatically rerunning tests as you make changes to your code.

---

## Docker Setup

You can use Docker to run the application inside containers, which is helpful for development, testing, or deployment.

1. **Start the Application with Docker Compose**:

   ```bash
   docker compose up -d
   ```

   This will start the application in the background using Docker Compose, with all the necessary services defined in the `docker-compose.yml` file.

   - The application will be available on the port defined in the `docker-compose.yml` file (usually `localhost:3000` by default).

---

## Generate Documentation with Compodoc

This project uses **Compodoc** to generate interactive documentation for the NestJS application. You can generate the documentation by running the following command:

```bash
npm run make:doc
```

This will generate a detailed set of documentation about the project's modules, services, controllers, and more. You can use the generated documentation to better understand the structure and features of the application.

---

## Run Database Seeder

The application includes database seeding scripts for both local and production environments. Follow the instructions below to run the seeder in either environment.

### On Docker

To run the database seeder on a production environment inside Docker, make sure to set the `NODE_ENV` environment variable to `production`:

1. **Enter the Docker container**:

   ```bash
   docker exec -it api sh
   ```

2. **Run the seeder**:

   ```bash
   npm run db:seed:prod
   ```

This will seed the database with the production data.

### On Local Environment

For local development, make sure to set the `NODE_ENV` environment variable to `development` before running the seeder:

```bash
npm run db:seed
```

This will seed the database with sample data tailored for the development environment.

---

## Folder Structure

The project is organized into multiple directories to separate concerns and improve maintainability. Here’s an overview of the folder structure:

```
erp-server
├── .husky                          # Github hooks management
├── coverage/                       # Generated test coverage reports
├── dist/                           # Compiled code (after build)
├── documentation/                  # Generated Compodoc documentation
├── libs/                           # Reusable shared libraries
│   ├── lib...                      # Library modules
├── src/                            # Application source code
│   ├── domains/                    # Domain-specific modules
│   │   ├── domain/                 # Specific domain module (e.g. User, Product)
│   │   │   ├── dto/                # data validation schema
│   │   │   ├── entity/             # database models and subscribers
│   │   │   ├── seeders/            # database seeders data
│   │   │   ├── domain.access       # domain access enumerable
│   │   │   ├── domain.controller   # domain access enumerable
│   │   │   ├── domain.module       # domain module
│   │   │   ├── domain.service      # domain service
│   ├── jobs/                       # Scheduled jobs module
│   │   ├── job...                  # Specific job module (e.g. DataSync)
│   ├── app.module.ts               # Root module that imports all other modules
│   ├── main.ts                     # Entry point for bootstrapping the application
├── test/                           # Integration test
│   ├── domain/                     # integration test per domain module
│   ├── helper/                     # integration test helper
├── .dockerignore                   # Specifies which files to ignore when building Docker images
├── .env                            # Environment variables for app configuration (e.g. database URL, API keys)
├── .gitignore                      # Files and folders ignored by Git
├── .prettierrc                     # Prettier configuration (code formatting)
├── backup.sh                       # Database Backup Script
├── docker-compose.yml              # Docker Compose configuration for multi-container setup
├── Dockerfile                      # Dockerfile for building the app's Docker image
├── eslint.config.mjs               # ESLint configuration (JavaScript linting)
├── LICENSE                         # Project license (e.g. MIT)
├── nest-cli.json                   # NestJS CLI configuration
├── nginx.config                    # NGINX configuration (for reverse proxy)
├── package-lock.json               # Lock file for npm dependencies (ensures reproducible builds)
├── package.json                    # npm dependencies and scripts
├── README.md                       # Project documentation (this file)
├── tsconfig.build.json             # TypeScript config for the build process
├── tsconfig.json                   # TypeScript config for the application
```

---

## Create a New Domain

To generate a new domain-specific module, use the NestJS CLI:

```bash
nest g res domains/<DomainName>
```

This will generate a new resource (controller, service, and module) in the `src/domains/` directory.

---

## Create a New Library

To generate a new reusable library module, use the following command:

```bash
nest g lib <LibName>
```

This will create a new library under the `libs/` directory, which can be used across different parts of the application.

---

## Create a New Job

To create a new scheduled job module, use the following command:

```bash
nest g res jobs/<JobName>
```

This will generate a new job module in the `src/jobs/` directory. Jobs are typically used for tasks that need to run on a schedule (e.g., cron jobs).

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

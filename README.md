# Project Setup Guide

Follow these steps to set up and run the backend application locally.

## Prerequisites

- **Node.js**: [Install Node.js](https://nodejs.org/) (includes npm)
- **Database**: Ensure you have a database server (e.g., MySQL, PostgreSQL) running.

## Installation Steps

 **Clone the Repository**

   git clone <repository-url>
   cd <repository-directory>

## Install Dependencies
    npm install or  yarn install

## Configure the Database

** Edit config/config.json and .env  with your database details:

    {
    "development": {
    "username": "root",
    "password": "your_password",
    "database": "your_database",
    "host": "127.0.0.1",
    "dialect": "mysql"
    }

## Run Migrations
  npx sequelize-cli db:migrate

## Run Seeders
npx sequelize db:seed:all

## Generate Encription Keys
node scripts/generate-keys.js

## Start the Application

  npm start or npm run dev


# Extra commands if needed

# Drop existing tables
` npx sequelize-cli db:drop `

# Create database again
` npx sequelize-cli db:create `

# Run migrations
` npx sequelize-cli db:migrate `

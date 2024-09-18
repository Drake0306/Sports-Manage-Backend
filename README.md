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

## Start the Application

  npm start or npm run dev

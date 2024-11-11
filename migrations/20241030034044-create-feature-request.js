'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FEATUREREQUEST', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      desc: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      file: {
        type: Sequelize.STRING,
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('high', 'medium', 'low'), // Updated to ENUM type
        allowNull: false,
        defaultValue: 'medium' // Set default value to 'medium'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      requestFor: { // New column for request type
        type: Sequelize.ENUM('bug', 'feature'),
        allowNull: false,
        defaultValue: 'feature' // Default value can be set to 'feature'
      },
      userId: { // New column to map user to the request
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'USERS', // Ensure this matches the actual table name for users
          key: 'id' // Key in the referenced table
        },
        onUpdate: 'CASCADE', // Handle updates in the referenced table
        onDelete: 'RESTRICT' // Prevent deletion of referenced user
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // Sets default to current timestamp
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // Sets default to current timestamp
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FEATUREREQUEST');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('COACHTEAM', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teamName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      teamCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Ensures each team code is unique
      },
      teamLogo: {
        type: Sequelize.STRING,
        allowNull: true // Allows null if logo is optional
      },
      sport: {
        type: Sequelize.INTEGER, // Store the ID of the sport from the SportsList table
        allowNull: false,
        references: {
          model: 'SPORTSLIST', // Ensure the model name matches the table name
          key: 'id' // Key in the referenced table
        },
        onUpdate: 'CASCADE', // Handles updates in the referenced table
        onDelete: 'RESTRICT' // Change this to RESTRICT or CASCADE
      },
      coachId: {
        type: Sequelize.INTEGER, // Assuming coachId will store the ID of the user
        allowNull: false, // Not nullable
        references: {
          model: 'USERS', // Ensure the model name matches the user table name
          key: 'id' // Key in the referenced table
        },
        onUpdate: 'CASCADE', // Optional: handles updates in the referenced table
        onDelete: 'RESTRICT' // Optional: handles deletions in the referenced table
      },
      teamColor: {
        type: Sequelize.STRING,
        allowNull: false // Not nullable
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'archived'),
        allowNull: false,
        defaultValue: 'active' // Default value set to 'active'
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
    await queryInterface.dropTable('COACHTEAM');
  }
};

  'use strict';

  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('coachTeam', {
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
      await queryInterface.dropTable('coachTeam');
    }
  };

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sportsList', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sportName: {
        type: Sequelize.STRING,
        allowNull: false // sportName is required
      },
      sportIcon: {
        type: Sequelize.STRING,
        allowNull: true // sportIcon can be null
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'), // status can be 'active' or 'inactive'
        allowNull: false,
        defaultValue: 'active' // default is 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // sets default to current timestamp
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // sets default to current timestamp
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sportsList');
  }
};

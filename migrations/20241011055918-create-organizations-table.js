'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Organizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false // name is required
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true // address can be null
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: true // contact can be null
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: true // logo can be null
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'), // status can be 'active' or 'inactive'
        allowNull: false,
        defaultValue: 'active' // default is 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Organizations');
  }
};

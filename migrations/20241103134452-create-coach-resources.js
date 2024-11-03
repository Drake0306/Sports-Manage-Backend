'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coachResources', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      finalForms: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      spiritShop: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tickets: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      Dragonfly: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'active'
      },
      coachId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // references the users table
          key: 'id' // key in the users table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Change SET NULL to CASCADE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('coachResources');
  }
};

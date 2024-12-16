'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GROUP_MEMBERSHIPS', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GROUPS', // the table name you are referencing
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: { // assuming you will have a user ID referencing another table
        type: Sequelize.INTEGER,
        allowNull: false
      },
      role: { // For example, you can store roles like admin, member, etc.
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GROUP_MEMBERSHIPS');
  }
};

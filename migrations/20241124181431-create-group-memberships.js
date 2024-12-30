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
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GROUPS', // the table name you are referencing
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: { // For example, you can store roles like admin, member, etc.
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GROUP_MEMBERSHIPS');
  }
};

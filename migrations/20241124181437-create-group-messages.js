'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GROUP_MESSAGES', {
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
          model: 'GROUPS',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'group_id' // Using the underscored field name as per the model
      },
      senderPhone: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'sender_phone' // Using the underscored field name as per the model
      },
      encryptedContent: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'encrypted_content' // Using the underscored field name as per the model
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read'),
        defaultValue: 'sent'
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
    await queryInterface.dropTable('GROUP_MESSAGES');
  }
};

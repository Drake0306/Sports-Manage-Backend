'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MESSAGES', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      room_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'CHATROOMS',
          key: 'room_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sender_phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      encrypted_content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read'),
        defaultValue: 'sent'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('MESSAGES', ['room_id']);
    await queryInterface.addIndex('MESSAGES', ['sender_phone']);
    await queryInterface.addIndex('MESSAGES', ['created_at']);
    await queryInterface.addIndex('MESSAGES', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MESSAGES');
  }
};

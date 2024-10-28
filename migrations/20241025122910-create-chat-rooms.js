'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      room_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      participant1_phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      participant2_phone: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.addIndex('chat_rooms', ['room_id']);
    await queryInterface.addIndex('chat_rooms', ['participant1_phone']);
    await queryInterface.addIndex('chat_rooms', ['participant2_phone']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chat_rooms');
  }
};
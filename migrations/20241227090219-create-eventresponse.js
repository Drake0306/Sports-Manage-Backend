'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('eventresponses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EVENTS',  // Referencing the EVENTS table
          key: 'id'         // Column in EVENTS table
        },
        onUpdate: 'CASCADE', // Optional: If an event is updated, this will update eventId in eventresponses
        onDelete: 'CASCADE'  // Optional: If an event is deleted, this will delete related eventresponses
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      response: {
        type: Sequelize.STRING, // Response can be a string (e.g., "attending", "not attending")
        allowNull: false
      },
      status: {
        type: Sequelize.STRING, // Can represent the status of the response, like "pending", "accepted", etc.
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW  // Automatically set the current timestamp
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW  // Automatically set the current timestamp
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('eventresponses');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coachAnnouncement', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coachId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Ensure this matches the actual table name for users
          key: 'id' // Key in the referenced table
        },
        onUpdate: 'CASCADE', // Handle updates in the referenced table
        onDelete: 'RESTRICT' // Prevent deletion of referenced coach
      },
      announcement: {
        type: Sequelize.TEXT, // Use TEXT for longer announcements
        allowNull: false // Announcement is required
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'), // Status can be 'active' or 'inactive'
        allowNull: false,
        defaultValue: 'active' // Default is 'active'
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
    await queryInterface.dropTable('coachAnnouncement');
  }
};

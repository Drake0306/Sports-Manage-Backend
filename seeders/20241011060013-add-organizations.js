'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Organizations', [
      {
        name: 'Organization One',
        address: '123 Main St',
        contact: '123-456-7890',
        logo: 'logo1.png',
        status: 'active', // Set the status to active
        createdAt: new Date(),
        updatedAt: new Date()
      }      // Add more dummy data as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Organizations', null, {});
  }
};

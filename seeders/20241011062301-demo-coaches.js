'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Coaches', [
      {
        type: 'Fitness',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'Mental Health',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'Life',
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Coaches', null, {});
  }
};

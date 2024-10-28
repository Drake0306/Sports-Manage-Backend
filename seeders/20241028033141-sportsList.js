'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('sportsList', [
      { sportName: 'Basketball', sportIcon: '🏀', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Football', sportIcon: '🏈', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Baseball', sportIcon: '⚾', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Soccer', sportIcon: '⚽', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Volleyball', sportIcon: '🏐', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Tennis', sportIcon: '🎾', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Cheerleading', sportIcon: '📣', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Hockey', sportIcon: '🏒', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Swimming', sportIcon: '🏊', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { sportName: 'Cricket', sportIcon: '🏏', status: 'active', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sportsList', null, {});
  }
};

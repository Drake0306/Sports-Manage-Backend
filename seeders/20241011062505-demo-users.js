'use strict';
const bcrypt = require('bcryptjs'); // Import bcryptjs

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPassword = await bcrypt.hash('admin@12345', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        email: 'admin@yopmail.com',
        password: adminPassword, // Normally, you should hash passwords
        firstname: 'John',
        lastname: 'Doe',
        role: 'admin',
        contactNumber: '123-456-7890',
        dateOfBirth: '1990-01-01',
        isVerify: 1,
        socialLogin: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // {
      //   username: 'jane_smith',
      //   email: 'jane@example.com',
      //   password: 'hashedpassword456', // Normally, you should hash passwords
      //   firstname: 'Jane',
      //   lastname: 'Smith',
      //   role: 'admin',
      //   contactNumber: '987-654-3210',
      //   dateOfBirth: '1985-05-15',
      //   isVerify: 1,
      //   socialLogin: 0,
      //   status: 'active',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   username: 'coach_mike',
      //   email: 'mike@example.com',
      //   password: 'hashedpassword789', // Normally, you should hash passwords
      //   firstname: 'Mike',
      //   lastname: 'Johnson',
      //   role: 'coach',
      //   contactNumber: '555-555-5555',
      //   dateOfBirth: '1980-10-10',
      //   isVerify: 1,
      //   socialLogin: 1,
      //   status: 'active',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

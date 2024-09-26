'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Validates email format
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('coach', 'parent', 'user', 'admin'),
      allowNull: false
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isVerify: { // New field for verification status
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // Default value set to 0
    },
    socialLogin: { // New field for social login status
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // Default value set to 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active' // Default value set to 'active'
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true // Enable createdAt and updatedAt fields
  });

  return User;
};

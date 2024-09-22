'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
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
      allowNull: false // New field for contact number
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true // New field for date of birth
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

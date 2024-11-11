'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class USERS extends Model {
    static associate(models) {
      USERS.hasOne(models.USERDETAILS, { foreignKey: 'userId', onDelete: 'CASCADE' });
      USERS.hasMany(models.JOINEDTEAMDATA, { foreignKey: 'userId', as: 'joinedTeams' }); 
      USERS.hasOne(models.STUDENTGUARDIAN, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }
  
  USERS.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    username: { // New username field
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensure that usernames are unique
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
      type: DataTypes.ENUM('coach', 'parent', 'user', 'admin', 'student'),
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
    isVerify: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    socialLogin: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    }, userImage: { // New userImage field
      type: DataTypes.STRING,
      allowNull: true // It can be null
    }
  }, {
    sequelize,
    modelName: 'USERS',
    tableName: 'users', // Specify the table name in uppercase
    timestamps: true // Enable createdAt and updatedAt fields
  });

  return USERS;
};

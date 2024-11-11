'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ORGANIZATIONS extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  
  ORGANIZATIONS.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: { // New status column
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active' // Default value set to 'active'
    }
  }, {
    sequelize,
    modelName: 'ORGANIZATIONS',
    tableName:'organizations',
    timestamps: true
  });

  return ORGANIZATIONS;
};
